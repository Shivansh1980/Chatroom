from chatapp.models import Message
from django.db import connection
import itertools
import json


class SQL:
    cursor = connection.cursor()

    def raw_exec(self, query):
        self.cursor.execute(query)
        rows = self.cursor.fetchall()
        return rows

    def get_dict_by_columns(self, query_result, columns):
        if(len(query_result) > 0):
            pass

    def get_all_tables(self):
        tables = connection.introspection.table_names()
        seen_models = connection.introspection.installed_models(tables)
        return seen_models

    def exec(self, query):
        self.cursor.execute(query)
        desc = self.cursor.description
        try:
            column_names = [col[0] for col in desc]
            data = [dict(zip(column_names, row))
                    for row in self.cursor.fetchall()]
            return data
        except Exception as e:
            return {'error': str(e)}


class RequestParser:
    def __init__(self, request):
        data = {}
        files = request.FILES
        
        try:
            data = request.data
        except:
            data = {}

        try:
            if(len(data) == 0):
                data = request.body
                data = json.loads(data)
        except Exception as e:
            data = {}
            files = {}
        
        if len(data) == 0:
            data = request.POST

        if len(data) == 0:
            data = request.GET

        if len(files) == 0:
            files = {}

        self.data = data
        self.files = files

    def get(self, key):
        return self.data.get(key, None)

    def get_file(self, key):
        try:
            return self.files[key]
        except:
            return None

    def is_file_exists(self, key):
        try:
            self.files[key]
            return True
        except:
            return False

    def get_dict(self):
        d = {}
        for key in self.data.keys():
            d[key] = self.data.get(key)
        return d

    def append(self, key, val):
        try:
            self.data[key] = val
        except:
            try:
                self.data = self.data.copy()
                self.data[key] = val
            except:
                return self.data[key]

    def compare(self, key1, key2, **kwargs):
        try:
            if(str(self.data[key2]) == str(self.data[key1])):
                if(len(kwargs) != 0):
                    for key in kwargs:
                        if str(self.data[key]) != str(self.data[key1]):
                            return False
                        else:
                            continue
                return True
            else:
                return False
        except:
            return False

    def exists(self, key):
        if key in self.data:
            return True
        else:
            return False

    def __getitem__(self, key):
        return self.data.get(key, None)

    def __setitem__(self, key, val):
        try:
            self.data[key] = val
        except:
            try:
                self.data = self.data.copy()
                self.data[key] = val
            except:
                return self.data[key]

    def __len__(self):
        return len(self.data)

    def __str__(self):
        return json.dumps(self.data)
