import os, django
import sys

from importCSV_functions.functions import for_insert, for_update, get_attributes, get_dataDB, get_dataXLSX, check_headers

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev_frane")

django.setup()


def funkcija(filename):
    attributes = get_attributes()
    headerDB, dataDB = get_dataDB()
    headerXLSX, dataXLSX, stop, msg = get_dataXLSX(filename)
    if stop:
        sys.exit(msg)

    stop, msg = check_headers(headerXLSX, headerDB)
    if stop:
        sys.exit(msg)

    updated = 0
    unchanged = 0
    inserted = 0
    needs_correction = 0
    deleted = 0
    errors = []
    records_for_insert = []

    for ind, (uuid, row) in enumerate(dataXLSX.items()):
        if uuid in dataDB:
            if for_update(row, dataDB[uuid]):
                no_errors, error_list = for_insert(ind + 2, row, attributes)
                if no_errors:
                    records_for_insert.append(row)
                    updated += 1
                else:
                    errors = errors + error_list
                    needs_correction += 1
            else:
                unchanged += 1
        else:
            if uuid == '<delete>':
                deleted += 1
                # delete()
                continue

            no_errors, error_list = for_insert(ind + 2, row, attributes)
            if no_errors:
                records_for_insert.append(row)
                inserted += 1
            else:
                errors = errors + error_list
                needs_correction += 1

    #print("Inserted: {}, updated: {}, deleted: {}, unchanged: {}, needs to be corrected: {}.".format(inserted, updated, deleted, unchanged, needs_correction))
    #print(errors)
    return errors
funkcija('waterpoints_test.xlsx')
