import rawCsv from "../../sample_data/cumulative_2025.10.02_18.47.45.csv?raw";

const cleanLines = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

const mapRecord = (headers, values) => {
  const record = {};

  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });

  return record;
};

export const parseFirstPlanetRecord = (csvText) => {
  const lines = cleanLines(csvText);

  if (lines.length < 2) {
    return null;
  }

  const headers = lines[0].split(",");
  const values = lines[1].split(",");

  return mapRecord(headers, values);
};

const samplePlanet = parseFirstPlanetRecord(rawCsv) ?? {};

export default samplePlanet;
