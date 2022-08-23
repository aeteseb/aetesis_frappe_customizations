from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in aetesis/__init__.py
from aetesis import __version__ as version

setup(
	name="aetesis",
	version=version,
	description="Aetesis Customisations",
	author="Sebastian Beck",
	author_email="sebastian@aetesis.ch",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
