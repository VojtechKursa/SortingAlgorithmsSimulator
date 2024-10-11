# Sorting Algorithms Simulator

## Introduction

This is a web-based application for simulating and visualizing sorting algorithms.
It was (still is being) developed as part of my Bachelor Thesis.

## Building

### Install prerequisites

To build this web application, first you need to install required packages.
Run command to install the required packages based on your package manager, for example for NPM it's.

```sh
npm install
```

### Build

Then you can run either

```sh
npm run build
```

to build the application in production mode or

```sh
npm run build:dev
```

to build the application in development mode.

### Output

The built application will be located in the `dist` folder in the root directory of the repo.

### Development server

Repo contains a simple HTTP server that will serve the built application on a loopback interface, to run it, use the command

```sh
npm run serve
```
