import unittest
import json

import server
from utils import populate_plugins


class ServerTest(unittest.TestCase):

    def setUp(self):
        populate_plugins()

        server.app.testing = True
        self.app = server.app.test_client()

        server.app.config['SAVU'] = {
            "data_location": {
                "default": "/path/to/data"
            },
            "process_list_location": {
                "default": "/path/to/process_lists"
            },
            "output_location": {
                "default": "/path/to/output"
            },
        }

    def test_get_plugin(self):
        rv = self.app.get('/plugin')
        data = json.loads(rv.data)

        self.assertTrue(isinstance(data, list))
        self.assertGreater(len(data), 0)

    def test_get_plugin_info_no_citation(self):
        rv = self.app.get('/plugin/Dezinger')
        data = json.loads(rv.data)
        self.assertEqual(len(data['citation']), 0)

    def test_get_plugin_info_1_citation(self):
        rv = self.app.get('/plugin/TomopyRecon')
        data = json.loads(rv.data)
        self.assertEqual(len(data['citation']), 1)

    def test_get_plugin_info_multiple_citation(self):
        rv = self.app.get('/plugin/AstraReconGpu')
        data = json.loads(rv.data)
        self.assertEqual(len(data['citation']), 3)

    def test_data_default_paths(self):
        rv = self.app.get('/default_paths')
        data = json.loads(rv.data)
        self.assertEqual('/path/to/data', data['data'])
        self.assertEqual('/path/to/process_lists', data['process_list'])
        self.assertEqual('/path/to/output', data['output'])

if __name__ == '__main__':
    unittest.main()
