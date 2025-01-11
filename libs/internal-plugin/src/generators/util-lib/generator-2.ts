import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateJson,
} from '@nx/devkit';
import { UtilLibGeneratorSchema } from './schema';
import { libraryGenerator } from '@nx/js';

function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const allScopes: string[] = Array.from(projectMap.values())
    .map((project) => {
      if (project.tags) {
        const scopes = project.tags.filter((tag: string) => tag.startsWith('scope:'));
        return scopes;
      }
      return [];
    })
    .reduce((acc, tags) => [...acc, ...tags], [])
    .map((scope: string) => scope.slice(6));

  // remove duplicates
  return Array.from(new Set(allScopes));
}

function updateSchemaJson(tree: Tree, scopes: string[]) {
  updateJson(tree, 'libs/internal-plugin/src/generators/util-lib/schema.json', (schemaJson) => {
    schemaJson.properties.directory['x-prompt'].items = scopes.map(
      (scope) => ({
        value: scope,
        label: scope,
      })
    );
    schemaJson.properties.directory.enums = scopes;
    return schemaJson;
  });
}

function updateSchemaInterface(tree: Tree, scopes: string[]) {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const interfaceDefinitionFilePath = 'libs/internal-plugin/src/generators/util-lib/schema.d.ts';
  const newContent = `export interface UtilLibGeneratorSchema {
    name: string;
    directory: ${joinScopes};
  }`;
  tree.write(interfaceDefinitionFilePath, newContent);
}

export async function utilLibGenerator(
  tree: Tree,
  options: UtilLibGeneratorSchema
) {
  await libraryGenerator(tree, {
    directory: `libs/${options.directory}/${options.name}`,
  });
  const scopes = getScopes(getProjects(tree));
  updateSchemaJson(tree, scopes);
  updateSchemaInterface(tree, scopes);
  await formatFiles(tree);
}

export default utilLibGenerator;
