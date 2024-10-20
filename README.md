# autophoto

## Install project

### Biome linter

```shell
deno add npm:@biomejs/biome@1.9.4
deno install --allow-scripts=npm:@biomejs/biome@1.9.4
```

## Tests

### E2E

```shell
LOGIN=... PASSWORD=... deno task e2e:publish
```
