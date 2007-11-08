from setuptools import setup, find_packages

version = '0.1'

setup(name='opencore.js',
      version=version,
      description="javascript and zcml registrations required for opencore",
      long_description="""\
""",
      # Get more strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Framework :: Zope2",
        "Framework :: Zope3",
        "Programming Language :: Python",
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
          'topp.utils',
      ],
      entry_points="""
      [distutils.commands]
      zinstall = topp.utils.setup_command:zinstall      
      """,
      )
