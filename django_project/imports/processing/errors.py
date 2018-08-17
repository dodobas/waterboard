# -*- coding: utf-8 -*-


class StopError(Exception):
    """Base class for exceptions in this module"""
    pass


class FileError(StopError):

    def __init__(self, description):
        self.description = description
        self.message = 'Please upload new file.'


class UnnamedColumnError(StopError):

    def __init__(self, description):
        self.description = description
        self.message = 'Please correct error and upload file again.'


class MultipleUuidError(StopError):

    def __init__(self, description):
        self.description = description
        self.message = 'Please correct error and upload file again.'


class NoRequiredColumnError(StopError):

    def __init__(self, description):
        self.description = description
        self.message = 'Please correct error and upload file again.'
