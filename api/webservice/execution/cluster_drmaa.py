import glob
import os

import drmaa

# TODO
# from savu.tomo_recon import __get_folder_name as get_folder_name
def get_folder_name(a):
    return '_output'

from webservice.execution import Job, JobRunner


class DRMAAJob(Job):
    def __init__(self, cluster, data_path, process_list, output_path):
        self._cluster = cluster

        # We get the name of the directory as per running savu without the
        # --folder argument.
        # This allows us to know what the actual output directory will be so we
        # can determine the output data filename.
        output_subdir = get_folder_name(data_path)

        self._full_output_path = os.path.join(output_path, output_subdir)

        job = self._cluster.createJobTemplate()
        job.nativeSpecification = "-q high.q@@com14 -P tomography -l exclusive -l gpu=2 -l gpu_arch=Pascal"
        job.remoteCommand = '/dls/tmp/ibn32760/hebi_cluster_submit.sh'
        job.workingDirectory = output_path
        job.args = [
            data_path,
            process_list,
            output_path,
            "--folder",
            output_subdir,
        ]

        self._job_id = self._cluster.runJob(job)
        self._cluster.deleteJobTemplate(job)

    def id(self):
        return str(self._job_id)

    def terminate(self):
        self._cluster.control(self._job_id, drmaa.JobControlAction.TERMINATE)

    def running(self):
        return self._query_status() == drmaa.JobState.RUNNING

    def successful(self):
        return self._query_status() == drmaa.JobState.DONE

    def status(self):
        status_names = {
            drmaa.JobState.UNDETERMINED: 'undetermined',
            drmaa.JobState.QUEUED_ACTIVE: 'queued and active',
            drmaa.JobState.SYSTEM_ON_HOLD: 'queued and in system hold',
            drmaa.JobState.USER_ON_HOLD: 'queued and in user hold',
            drmaa.JobState.USER_SYSTEM_ON_HOLD: 'queued and in user and system hold',
            drmaa.JobState.RUNNING: 'running',
            drmaa.JobState.SYSTEM_SUSPENDED: 'system suspended',
            drmaa.JobState.USER_SUSPENDED: 'user suspended',
            drmaa.JobState.DONE: 'successful',
            drmaa.JobState.FAILED: 'failed',
        }
        return status_names[self._query_status()]

    def output_dataset(self):
        candidate_files = glob.glob(
            os.path.join(self._full_output_path, "*_processed.nxs"))
        return None if len(candidate_files) == 0 else candidate_files[0]

    def _query_status(self):
        return self._cluster.jobStatus(self._job_id)


class DRMAAJobRunner(JobRunner):
    """
    Job runner that submits cluster jobs via DRMAA.
    """

    def __init__(self):
        super(DRMAAJobRunner, self).__init__()

        self._drmaa = drmaa.Session()
        self._drmaa.initialize()

    def close(self):
        self._drmaa.exit()

    def start_job(self, data_path, process_list, output_path):
        return self._add_job(
            DRMAAJob(self._drmaa, data_path, process_list, output_path))
