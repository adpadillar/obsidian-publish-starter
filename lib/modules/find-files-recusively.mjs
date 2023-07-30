import fs from "fs";
import path from "path";

/**
 * Recursively finds files in a directory with the specified file extension.
 *
 * @param {string} directory - The root directory to start the search from.
 * @param {RegExp} fileExtRegex - Regular expression to match file extensions.
 * @returns {string[]} - An array of file paths relative to the root directory.
 */
export const getFilesRecursively = (directory, fileExtRegex) => {
  let files = [];

  /**
   * Recursive function to find files within the specified directory.
   *
   * @param {string} dir - The current directory to search for files.
   */
  const recursiveFindFiles = (dir) => {
    const filesInDirectory = fs.readdirSync(dir);
    for (const file of filesInDirectory) {
      const absolute = path.join(dir, file);
      if (fs.statSync(absolute).isDirectory()) {
        recursiveFindFiles(absolute);
      } else if (path.extname(absolute).match(fileExtRegex)) {
        files.push(path.relative(directory, absolute));
      }
    }
  };

  recursiveFindFiles(directory);
  return files;
};
