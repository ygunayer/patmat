# Changelog
All notable changes in this project will be documented in this file.

## [0.2.3] - 2020-01-04
- Increased code coverage to 99%+
- Fixed a bug that caused arrays being always matched against, even if they were completely different
- Fixed a bug that caused functions to be matched as objects first
- Fixed a bug that caused combined partial functions to prematurely throw errors when `isDefinedAt` was called
- Fixed a bug that caused matching against an object to always return true even if a single field was a match despite other fields not matching
- Added a VSCode debug script for tests

## [0.2.2] - 2019-11-24
- Removed Travis-based auto deployments
- Matching against functions that throw exceptions now always yield false results

## [0.2.1] - 2019-11-12
- Package structure slightly changed.

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
