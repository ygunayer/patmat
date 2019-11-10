# Changelog
All notable changes in this project will be documented in this file.

## [0.2.0] - 2019-11-10
Massively reworked project to streamline codebase

- **BREAKING** Entire implementation is now synchronous
    - Support for async clauses and async inputs are now removed, however, async result handles are still supported
    - Users are now expected to `await` any promises before passing them over to a pattern
- Patterns are now composable
    - Implementation is based on the concept of partial functions. See [src/lib/partial-function.ts](./src/lib/partial-function.ts)
- Test coverage improved
- Almost everything has comments now

## [0.1.3] - 2019-11-01
- Internal types are now exported

## [0.1.2] - 2019-10-30
- Sync and async typings are now more clear
- ES5 function blocks are now supported
- Automated builds are now in place
    - With code coverage and automated releases

## [0.1.0] - Initial Release
- Initial version
