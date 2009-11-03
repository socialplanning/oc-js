from setuptools import setup, find_packages

version = '0.7'

f = open('README.txt')
readme = "".join(f.readlines())
f.close()

setup(name='oc-js',
      version=version,
      description="javascript and zcml registrations required for opencore",
      long_description=readme,
      # Get more strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Framework :: Zope3",
        "Framework :: YUI-ext",
        "Programming Language :: Javascript",
        "Topic :: Software Development :: Libraries :: Python Modules",
        ],
      keywords='javascript zcml',
      author='opencore dev team',
      author_email='opencore-dev@lists.openplans.org',
      url='http://www.openplans.org/projects/opencore',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['opencore'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'topp.utils>=0.2.8.9',
      ],
      entry_points="""
      [distutils.commands]
      zinstall = topp.utils.setup_command:zinstall      
      """,
      )
