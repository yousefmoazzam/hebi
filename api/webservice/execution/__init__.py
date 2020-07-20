class NoSuchJobError(RuntimeError):
    """
    Used to indicate that a job of a given identifier was not found.
    """
    pass


class Job(object):
    """
    Stores job state.
    """

    def to_dict(self):
        return {
            "id": self.id(),
            "running": self.running(),
            "successful": self.successful(),
            "status": self.status(),
            "output_dataset": self.output_dataset(),
            "logfile": self.logfile_contents(),
        }

    def id(self):
        raise NotImplementedError()

    def terminate(self):
        raise NotImplementedError()

    def running(self):
        raise NotImplementedError()

    def successful(self):
        raise NotImplementedError()

    def status(self):
        raise NotImplementedError()

    def output_dataset(self):
        raise NotImplementedError()

    def logfile_contents():
        raise NotImplementedError()


class JobRunner(object):
    """
    Used to start and manage (query status, terminate, etc.) Savu jobs.
    """

    def __init__(self):
        self._jobs = {}

    def close(self):
        pass

    def _add_job(self, job):
        identifier = job.id()
        self._jobs[identifier] = job
        return identifier

    def job(self, identifier):
        if identifier not in self._jobs:
            raise NoSuchJobError()

        return self._jobs[identifier]

    def start_job(self, data_path, process_list, output_path):
        raise NotImplementedError()
