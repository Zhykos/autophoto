<h1 align="center">
  <img src="./doc/header.webp" alt="" width="200">
</h1>

# autophoto

<h4 align="center">An application to automatically publish your photos</h4>

<p align="center">
  <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/Zhykos/autophoto/deno.yml?branch=main&style=for-the-badge">
  <img alt="GitHub Release" src="https://img.shields.io/github/v/release/Zhykos/autophoto?display_name=release&style=for-the-badge">
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a> •
  <a href="#projects-using-autophoto">Projects using autophoto</a>
</p>

![bluesky](doc/bluesky-post.webp)

## Key Features

* Scan your directory for photos
  - V1 only suppose to work with video game screenshots
  - Photos are detected by a path pattern
* Publish them to a remote server
  - V1 only supports Bluesky
  - Randomly select 4 photos and publish them
* Application is build as native desktop app
  - CLI based

## How To Use

Find the latest release [here](https://github.com/Zhykos/autophoto/releases).
Download the latest release for your platform and run the executable.

### To scan your directory for photos

#### Configuration file

First, you need to configure the application to scan your directory for photos with a YAML configuration file.

Example configuration file:

```yaml
autophoto:
  scan:
    - directory: ./test/resources/video-game
      type: video-game
      data-pattern:
        regex: '^(.+) \((\d{4})\)/(.+)/.+\.webp$'
        groups:
          - title
          - release-year
          - platform
```

As you can scan multiple directories, you can add multiple `scan` entries.

A `scan` entry has the following properties:
- `directory`: The directory to scan for photos
- `type`: The type of photos to scan for (V1 only supports `video-game`)
- `data-pattern`: The pattern to extract data from the photo path
  - `regex`: The regex to match the photo path
  - `groups`: The groups to extract from the regex (only the following groups are supported for now: `title`, `release-year`, `platform`)

In the example above, the application will scan the `./test/resources/video-game` directory for photos with the following path pattern:
`{video game title} ({release-year})/{platform}/photo-name.webp`

#### Run the application to scan your directories

Once you have your configuration file, you can run the application with the configuration file as argument: :

```shell
autophoto --scan ./path/to/your/configuration-file.yaml
```

The scanned data are stored in a SQLite database in the `db.autophoto.sqlite3` file.
But you can specify a different path for the database file with the `--database` option:

```shell
autophoto --scan ./path/to/your/configuration-file.yaml --database=./path/to/your/database-file.sqlite3
```

You can also activate the debug mode with the `--debug-database` option.
This will print the video games and photos detected during the scan:

```shell
autophoto --scan ./path/to/your/configuration-file.yaml --debug-database
```

### To publish your photos

You need a Bluesky account to publish your photos: [Bluesky](https://bsky.app/).

Then run the application with the `--publish` option and your Bluesky credentials:

```shell
autophoto --publish --bluesky_login=your_login --bluesky_password=your_password
```

You can also specify the path to the database file with the `--database` option:

```shell
autophoto --publish --bluesky_login=your_login --bluesky_password=your_password --database=./path/to/your/database-file.sqlite3
```

You can also activate the debug mode with the `--debug-database` option.
This will print the photos published:

```shell
autophoto --publish --bluesky_login=your_login --bluesky_password=your_password --debug-database
```

You can also specify the Bluesky URL with the `--bluesky_host` option:

```shell
autophoto --publish --bluesky_login=your_login --bluesky_password=your_password --bluesky_host=https://bsky.app
```

## Contributing

### Install the project

You need to install Deno to run the project: https://docs.deno.com/runtime/getting_started/installation/.

Activate the lint and format with Biome:

```shell
deno add npm:@biomejs/biome@1.9.4
deno install --allow-scripts=npm:@biomejs/biome@1.9.4
```

You'll be able to run the lint with the following command:

```shell
deno task lint
```

You'll be able to run the format with the following command:

```shell
deno task format
```

### Run the project

There is no run configuration for the project because I just used unit tests to develop the project.

However you can execute a scan with the following command:

```shell
deno task e2e:scan
```

It will use the configuration files `config.yml` and `./test/resources/config2.yml`.

You can execute a publish with the following command:

```shell
LOGIN=your_login PASSWORD=your_password deno task e2e:publish
```

### Run the tests

You can run the unit tests with the following command:

```shell
deno task test
```

You can run the coverage with the following command:

```shell
deno task coverage
```

It will generate a coverage report in the `coverage` directory and open it in your browser.

## Credits

This software uses the following open source packages:

- [Deno 2 - JavaScript runtime](https://deno.com/)
- [Biome - Lint and format](https://biomejs.dev/)
- [JavaScript Standards](https://jsr.io/@std)
- [atproto - For Bluesky](https://atproto.com/)
- [Multiformats](https://multiformats.io/)
- [README template](https://github.com/amitmerchant1990)
- I wish to not generate a header with IA so I used an image by <a href="https://unsplash.com/fr/@enikoo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">eniko kis</a> on <a href="https://unsplash.com/fr/photos/appareil-photo-instantane-polaroid-one-step-2-blanc-et-noir-sur-tableau-blanc-KsLPTsYaqIQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
- Everyone, somehow, because I used Copilot to help me write the code

## License

[MIT](https://opensource.org/license/MIT)

## Projects using autophoto

- [🖼️ Gallery of video games screenshots: more than 10.000 photos](https://bsky.app/profile/galleryvideogames.bsky.social)

---

> [zhykos.fr](https://www.zhykos.fr) &nbsp;&middot;&nbsp;
> GitHub [@zhykos](https://github.com/Zhykos) &nbsp;&middot;&nbsp;
> Bluesky [@zhykos](https://bsky.app/profile/zhykos.bsky.social)
