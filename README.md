borschik-tech-yate
==================

[![Build Status](https://travis-ci.org/doochik/borschik-tech-yate.svg?branch=master)](https://travis-ci.org/doochik/borschik-tech-yate)

Tech to build [Yate](https://github.com/pasaran/yate) with [Borschik](https://github.com/bem/borschik)


## Building for node
Use `borschik -t yate -to '{"node": true}'` to build for nodejs.
 

## `borschik-link` usage

`borschik-link()` in Yate works the same way as `borschik.link()` in JavaScript

1. Static path
```
match / {
    borschik-link('../real/path/to/file.png')
}
```

2. Dynamic path
```
match / {
    borschik-link('@my-name')
}
```
