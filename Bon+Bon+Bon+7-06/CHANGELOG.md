# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.2] - 2018-03-27
### Changed
- Changed approached used to sort images by `is_thumbnail` so that thumbnail images come first before others if present.

### Fixed
- Personal were shown even if Gift wrapping was not enabled on dashboard. Check on template if it's enabled in order to show them. Added a couple of lines on Readme file about this.
- When there were two items on cart, one custom box and another product, customer couldn't add a Personal note. Fixed making sure personal note attribute was present in order to look for wrapping options.

## [1.6.1] - 2018-03-14
### Changed
- Updated Detroit hour information.

## [1.6.0] - 2018-03-07
### Changed
- Updated Harmtrack Sunday hours on locations page.
- Changed word chocolatier for chocolate on about us page.
- Changed name Jay for Alex G. on contact us page.

## [1.5.3] - 2018-02-07
### Changed
- Client contact number on help navigation item and on contact us page.

[Unreleased]: https://gitlab.brandlabs.net/bon-bon-bon/bonbonbon.com/compare/v1.6.2...HEAD
[1.6.2]: https://gitlab.brandlabs.net/bon-bon-bon/bonbonbon.com/compare/v1.6.1...v1.6.2
[1.6.1]: https://gitlab.brandlabs.net/bon-bon-bon/bonbonbon.com/compare/v1.6.0...v1.6.1
[1.6.0]: https://gitlab.brandlabs.net/bon-bon-bon/bonbonbon.com/compare/v1.5.3...v1.6.0
[1.5.3]: https://gitlab.brandlabs.net/bon-bon-bon/bonbonbon.com/compare/v1.5.2...v1.5.3
