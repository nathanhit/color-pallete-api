from setuptools import setup, find_packages

setup(
    name="color-palette-api",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "openai>=1.0.0",
        "python-dotenv>=1.0.0",
    ],
    entry_points={
        'console_scripts': [
            'color-palette=color_palette_api.cli:main',
        ],
    },
)
