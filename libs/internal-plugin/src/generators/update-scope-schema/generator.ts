import { formatFiles, getProjects, Tree, updateJson } from '@nx/devkit';
import { UpdateScopeSchemaGeneratorSchema } from './schema';

export async function updateScopeSchemaGenerator(
  tree: Tree,
  options: UpdateScopeSchemaGeneratorSchema
) {
  const scopes = [...getProjects(tree).values()].map(project => project.tags?.filter(tag => tag.startsWith('scope:')))
  const scopes2 = [...new Set(scopes.flat())].filter(v=> v != undefined).map(v => v.split(':')[1])
  updateJson(
    tree,
    "libs/internal-plugin/src/generators/util-lib/schema.json",
    t => {
      t.properties.directory['x-prompt'].items = scopes2.map((scope) => ({
        value: scope,
        label: scope,
      }));
      return t;
    }
  );
  const schemaContent = tree.read('libs/internal-plugin/src/generators/util-lib/schema.d.ts').toString();
  const result = replaceScopes(schemaContent, scopes2)
  tree.write('libs/internal-plugin/src/generators/util-lib/schema.d.ts', result)
  await formatFiles(tree)
}

function replaceScopes(content: string, scopes: string[]): string {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const PATTERN = /interface UtilLibGeneratorSchema \{\n.*\n.*\n\}/gm;
  return content.replace(
    PATTERN,
    `interface UtilLibGeneratorSchema {
  name: string;
  directory: ${joinScopes};
}`
  );
}

export default updateScopeSchemaGenerator;
