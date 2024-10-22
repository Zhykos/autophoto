export type ConfigurationYamlType = {
  autophoto: {
    scan: ConfigurationYamlScanWithPatternType[];
  };
};

export type ConfigurationYamlScanWithPatternType = {
  directory: string;
  type: string;
  "data-pattern": ConfigurationYamlPatternType;
};

export type ConfigurationYamlPatternType = {
  regex: string;
  groups: string[];
};
