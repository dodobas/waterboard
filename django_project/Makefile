#Run pep8 style checking
#http://pypi.python.org/pypi/pep8
pep8:
	@echo
	@echo "-----------"
	@echo "PEP8 issues"
	@echo "-----------"
	@pep8 --version
	@pep8 --repeat --ignore=E203,E121,E122,E123,E124,E125,E126,E127,E128,E402 --exclude 'event_mapper/migrations*' . || true

pylint:
	@echo
	@echo "-----------------"
	@echo "Pylint violations"
	@echo "-----------------"
	@pylint --version
	@pylint --reports=n --rcfile=pylintrc setup.py event_mapper || true

test: 
	@echo
	@echo "-----------------"
	@echo "Run test"
	@echo "Usage:"
	@echo "make test SETTING=(file setting)"
	@echo "Running test with file setting = $(SETTING)"
	@python manage.py test --settings=$(SETTING)
