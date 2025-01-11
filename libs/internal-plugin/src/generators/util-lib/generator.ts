import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { libraryGenerator } from '@nx/js';
import { UtilLibGeneratorSchema } from './schema';

export async function utilLibGenerator(
  tree: Tree,
  options: UtilLibGeneratorSchema
) {

  const prefixedName = `${options.directory}-util-${options.name}`;
  const directory = `libs/${options.directory}/${prefixedName}`;
  await libraryGenerator(tree, {

    directory, tags: `scope:${options.directory}, type:util`
  });
  await formatFiles(tree);
}

export default utilLibGenerator;
