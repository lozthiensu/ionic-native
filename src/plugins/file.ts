import {Plugin, Cordova} from './plugin';
declare var window: any;
declare var cordova: any;

/** This interface represents a file system. */
export interface FileSystem {
  /* The name of the file system, unique across the list of exposed file systems. */
  name: string;
  /** The root directory of the file system. */
  root: DirectoryEntry;
}

/**
 * An abstract interface representing entries in a file system,
 * each of which may be a File or DirectoryEntry.
 */
export interface Entry {
  /** Entry is a file. */
  isFile: boolean;
  /** Entry is a directory. */
  isDirectory: boolean;
  /** The name of the entry, excluding the path leading to it. */
  name: string;
  /** The full absolute path from the root to the entry. */
  fullPath: string;
  /** The file system on which the entry resides. */
  fileSystem: FileSystem;
  nativeURL: string;
  /**
   * Look up metadata about this entry.
   * @param successCallback A callback that is called with the time of the last modification.
   * @param errorCallback   A callback that is called when errors happen.
   */
  getMetadata(successCallback: (metadata: Metadata) => void,
              errorCallback?: (error: FileError) => void): void;
  /**
   * Move an entry to a different location on the file system. It is an error to try to:
   *     move a directory inside itself or to any child at any depth;move an entry into its parent if a name different from its current one isn't provided;
   *     move a file to a path occupied by a directory;
   *     move a directory to a path occupied by a file;
   *     move any element to a path occupied by a directory which is not empty.
   * A move of a file on top of an existing file must attempt to delete and replace that file.
   * A move of a directory on top of an existing empty directory must attempt to delete and replace that directory.
   * @param parent  The directory to which to move the entry.
   * @param newName The new name of the entry. Defaults to the Entry's current name if unspecified.
   * @param successCallback A callback that is called with the Entry for the new location.
   * @param errorCallback   A callback that is called when errors happen.
   */
  moveTo(parent: DirectoryEntry,
         newName?: string,
         successCallback?: (entry: Entry) => void,
         errorCallback?: (error: FileError) => void): void;
  /**
   * Copy an entry to a different location on the file system. It is an error to try to:
   *     copy a directory inside itself or to any child at any depth;
   *     copy an entry into its parent if a name different from its current one isn't provided;
   *     copy a file to a path occupied by a directory;
   *     copy a directory to a path occupied by a file;
   *     copy any element to a path occupied by a directory which is not empty.
   *     A copy of a file on top of an existing file must attempt to delete and replace that file.
   *     A copy of a directory on top of an existing empty directory must attempt to delete and replace that directory.
   * Directory copies are always recursive--that is, they copy all contents of the directory.
   * @param parent The directory to which to move the entry.
   * @param newName The new name of the entry. Defaults to the Entry's current name if unspecified.
   * @param successCallback A callback that is called with the Entry for the new object.
   * @param errorCallback A callback that is called when errors happen.
   */
  copyTo(parent: DirectoryEntry,
         newName?: string,
         successCallback?: (entry: Entry) => void,
         errorCallback?: (error: FileError) => void): void;
  /**
   * Returns a URL that can be used as the src attribute of a <video> or <audio> tag.
   * If that is not possible, construct a cdvfile:// URL.
   * @return string URL
   */
  toURL(): string;
  /**
   * Return a URL that can be passed across the bridge to identify this entry.
   * @return string URL that can be passed across the bridge to identify this entry
   */
  toInternalURL(): string;
  /**
   * Deletes a file or directory. It is an error to attempt to delete a directory that is not empty. It is an error to attempt to delete the root directory of a filesystem.
   * @param successCallback A callback that is called on success.
   * @param errorCallback   A callback that is called when errors happen.
   */
  remove(successCallback: () => void,
         errorCallback?: (error: FileError) => void): void;
  /**
   * Look up the parent DirectoryEntry containing this Entry. If this Entry is the root of its filesystem, its parent is itself.
   * @param successCallback A callback that is called with the time of the last modification.
   * @param errorCallback   A callback that is called when errors happen.
   */
  getParent(successCallback: (entry: Entry) => void,
            errorCallback?: (error: FileError) => void): void;
}

/** This interface supplies information about the state of a file or directory. */
export interface Metadata {
  /** This is the time at which the file or directory was last modified. */
  modificationTime: Date;
  /** The size of the file, in bytes. This must return 0 for directories. */
  size: number;
}

/** This interface represents a directory on a file system. */
export interface DirectoryEntry extends Entry {
  /**
   * Creates a new DirectoryReader to read Entries from this Directory.
   */
  createReader(): DirectoryReader;
  /**
   * Creates or looks up a file.
   * @param path    Either an absolute path or a relative path from this DirectoryEntry
   *                to the file to be looked up or created.
   *                It is an error to attempt to create a file whose immediate parent does not yet exist.
   * @param options If create and exclusive are both true, and the path already exists, getFile must fail.
   *                If create is true, the path doesn't exist, and no other error occurs, getFile must create it as a zero-length file and return a corresponding FileEntry.
   *                If create is not true and the path doesn't exist, getFile must fail.
   *                If create is not true and the path exists, but is a directory, getFile must fail.
   *                Otherwise, if no other error occurs, getFile must return a FileEntry corresponding to path.
   * @param successCallback A callback that is called to return the File selected or created.
   * @param errorCallback   A callback that is called when errors happen.
   */
  getFile(path: string, options?: Flags,
          successCallback?: (entry: FileEntry) => void,
          errorCallback?: (error: FileError) => void): void;
  /**
   * Creates or looks up a directory.
   * @param path    Either an absolute path or a relative path from this DirectoryEntry
   *                to the directory to be looked up or created.
   *                It is an error to attempt to create a directory whose immediate parent does not yet exist.
   * @param options If create and exclusive are both true and the path already exists, getDirectory must fail.
   *                If create is true, the path doesn't exist, and no other error occurs, getDirectory must create and return a corresponding DirectoryEntry.
   *                If create is not true and the path doesn't exist, getDirectory must fail.
   *                If create is not true and the path exists, but is a file, getDirectory must fail.
   *                Otherwise, if no other error occurs, getDirectory must return a DirectoryEntry corresponding to path.
   * @param successCallback A callback that is called to return the Directory selected or created.
   * @param errorCallback   A callback that is called when errors happen.
   */
  getDirectory(path: string, options?: Flags,
               successCallback?: (entry: DirectoryEntry) => void,
               errorCallback?: (error: FileError) => void): void;
  /**
   * Deletes a directory and all of its contents, if any. In the event of an error (e.g. trying
   * to delete a directory that contains a file that cannot be removed), some of the contents
   * of the directory may be deleted. It is an error to attempt to delete the root directory of a filesystem.
   * @param successCallback A callback that is called on success.
   * @param errorCallback   A callback that is called when errors happen.
   */
  removeRecursively(successCallback: () => void,
                    errorCallback?: (error: FileError) => void): void;
}

export interface RemoveResult {
  success: boolean;
  fileRemoved: Entry;
}

/**
 * This dictionary is used to supply arguments to methods
 * that look up or create files or directories.
 */
export interface Flags {
  /** Used to indicate that the user wants to create a file or directory if it was not previously there. */
  create?: boolean;
  /** By itself, exclusive must have no effect. Used with create, it must cause getFile and getDirectory to fail if the target path already exists. */
  exclusive?: boolean;
}

export interface WriteOptions {
  replace?: boolean;
  append?: boolean;
  truncate?: number; // if present, number of bytes to truncate file to before writing
}

/**
 * This interface lets a user list files and directories in a directory. If there are
 * no additions to or deletions from a directory between the first and last call to
 * readEntries, and no errors occur, then:
 *     A series of calls to readEntries must return each entry in the directory exactly once.
 *     Once all entries have been returned, the next call to readEntries must produce an empty array.
 *     If not all entries have been returned, the array produced by readEntries must not be empty.
 *     The entries produced by readEntries must not include the directory itself ["."] or its parent [".."].
 */
export interface DirectoryReader {
  /**
   * Read the next block of entries from this directory.
   * @param successCallback Called once per successful call to readEntries to deliver the next
   *                        previously-unreported set of Entries in the associated Directory.
   *                        If all Entries have already been returned from previous invocations
   *                        of readEntries, successCallback must be called with a zero-length array as an argument.
   * @param errorCallback   A callback indicating that there was an error reading from the Directory.
   */
  readEntries(successCallback: (entries: Entry[]) => void,
              errorCallback?: (error: FileError) => void): void;
}

/** This interface represents a file on a file system. */
export interface FileEntry extends Entry {
  /**
   * Creates a new FileWriter associated with the file that this FileEntry represents.
   * @param successCallback A callback that is called with the new FileWriter.
   * @param errorCallback   A callback that is called when errors happen.
   */
  createWriter(successCallback: (writer: FileWriter) => void,
               errorCallback?: (error: FileError) => void): void;
  /**
   * Returns a File that represents the current state of the file that this FileEntry represents.
   * @param successCallback A callback that is called with the File.
   * @param errorCallback   A callback that is called when errors happen.
   */
  file(successCallback: (file: File) => void,
       errorCallback?: (error: FileError) => void): void;
}

/**
 * This interface provides methods to monitor the asynchronous writing of blobs
 * to disk using progress events and event handler attributes.
 */
export interface FileSaver extends EventTarget {
  /** Terminate file operation */
  abort(): void;
  /**
   * The FileSaver object can be in one of 3 states. The readyState attribute, on getting,
   * must return the current state, which must be one of the following values:
   *     INIT
   *     WRITING
   *     DONE
   */
  readyState: number;
  /** Handler for writestart events. */
  onwritestart: (event: ProgressEvent) => void;
  /** Handler for progress events. */
  onprogress: (event: ProgressEvent) => void;
  /** Handler for write events. */
  onwrite: (event: ProgressEvent) => void;
  /** Handler for abort events. */
  onabort: (event: ProgressEvent) => void;
  /** Handler for error events. */
  onerror: (event: ProgressEvent) => void;
  /** Handler for writeend events. */
  onwriteend: (event: ProgressEvent) => void;
  /** The last error that occurred on the FileSaver. */
  error: Error;
}

/**
 * This interface expands on the FileSaver interface to allow for multiple write
 * actions, rather than just saving a single Blob.
 */
export interface FileWriter extends FileSaver {
  /**
   * The byte offset at which the next write to the file will occur. This always less or equal than length.
   * A newly-created FileWriter will have position set to 0.
   */
  position: number;
  /**
   * The length of the file. If the user does not have read access to the file,
   * this will be the highest byte offset at which the user has written.
   */
  length: number;
  /**
   * Write the supplied data to the file at position.
   * @param {Blob} data The blob to write.
   */
  write(data: Blob | string): void;
  /**
   * The file position at which the next write will occur.
   * @param offset If nonnegative, an absolute byte offset into the file.
   *               If negative, an offset back from the end of the file.
   */
  seek(offset: number): void;
  /**
   * Changes the length of the file to that specified. If shortening the file, data beyond the new length
   * will be discarded. If extending the file, the existing data will be zero-padded up to the new length.
   * @param size The size to which the length of the file is to be adjusted, measured in bytes.
   */
  truncate(size: number): void;
}

/* FileWriter states */
declare var FileWriter: {
  INIT: number;
  WRITING: number;
  DONE: number
};

export interface FileReader {
  readyState: number; // see constants in var declaration below
  error: Error;
  result: string | ArrayBuffer; // type depends on readAsXXX() call type

  onloadstart: (evt: ProgressEvent) => void;
  onprogress: (evt: ProgressEvent) => void;
  onload: (evt: ProgressEvent) => void;
  onerror: (evt: ProgressEvent) => void;
  onloadend: (evt: ProgressEvent) => void;
  onabort: (evt: ProgressEvent) => void;

  abort(): void;
  readAsText(fe: FileEntry, encoding?: string): void;
  readAsDataURL(fe: FileEntry): void;
  readAsBinaryString(fe: FileEntry): void;
  readAsArrayBuffer(fe: FileEntry): void;
}

declare var FileReader: {
  EMPTY: number;
  LOADING: number;
  DONE: number;

  new(): FileReader;
};

export interface FileError {
  /** Error code */
  code: number;
  message: string;
}

declare var FileError: {
  new (code: number): FileError;
  NOT_FOUND_ERR: number;
  SECURITY_ERR: number;
  ABORT_ERR: number;
  NOT_READABLE_ERR: number;
  ENCODING_ERR: number;
  NO_MODIFICATION_ALLOWED_ERR: number;
  INVALID_STATE_ERR: number;
  SYNTAX_ERR: number;
  INVALID_MODIFICATION_ERR: number;
  QUOTA_EXCEEDED_ERR: number;
  TYPE_MISMATCH_ERR: number;
  PATH_EXISTS_ERR: number;
};

/**
 * @name File
 * @description
 * This plugin implements a File API allowing read/write access to files residing on the device.
 *
 * The File class implements static convenience functions to access files and directories.
 *
 * Example:
 * ```
 * import { File } from 'ionic-native';
 *
 * declare var cordova: any;
 * const fs:string = cordova.file.dataDirectory;
 * File.checkDir(this.fs, 'mydir').then(_ => console.log('yay')).catch(err => console.log('boooh'));
 * ```
 *
 *  This plugin is based on several specs, including : The HTML5 File API http://www.w3.org/TR/FileAPI/
 *  The (now-defunct) Directories and System extensions Latest: http://www.w3.org/TR/2012/WD-file-system-api-20120417/
 *  Although most of the plugin code was written when an earlier spec was current: http://www.w3.org/TR/2011/WD-file-system-api-20110419/
 *  It also implements the FileWriter spec : http://dev.w3.org/2009/dap/file-system/file-writer.html
 */
@Plugin({
  plugin: 'cordova-plugin-file',
  pluginRef: 'cordova.file',
  repo: 'https://github.com/apache/cordova-plugin-file'
})
export class File {
  static cordovaFileError: {} = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR',
    13: 'WRONG_ENTRY_TYPE',
    14: 'DIR_READ_ERR',
  };

  @Cordova()
  static getFreeDiskSpace(): Promise<number> {
    return;
  }

  /**
   * Check if a directory exists in a certain path, directory.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} dir Name of directory to check
   * @return {Promise<boolean|FileError>} Returns a Promise that resolves to true if the directory exists or rejects with an error.
   */

  static checkDir(path: string, dir: string): Promise<boolean|FileError> {
    if ((/^\//.test(dir))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    let fullpath = path + dir;
    return File.resolveDirectoryUrl(fullpath)
      .then(() => {
        return true;
      });
  }

  /**
   * Creates a new directory in the specific path.
   * The replace boolean value determines whether to replace an existing directory with the same name.
   * If an existing directory exists and the replace value is false, the promise will fail and return an error.
   *
   * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} dirName Name of directory to create
   * @param {boolean} replace If true, replaces file with same name. If false returns error
   * @return {Promise<DirectoryEntry|FileError>} Returns a Promise that resolves with a DirectoryEntry or rejects with an error.
   */

  static createDir(path: string, dirName: string, replace: boolean): Promise<DirectoryEntry|FileError> {
    if ((/^\//.test(dirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    let options: Flags = {
      create: true
    };

    if (replace) {
      options.exclusive = true;
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getDirectory(fse, dirName, options);
      });
  }

  /**
   * Remove a directory at a given path.
   *
   * @param {string} path The path to the directory
   * @param {string} dirName The directory name
   * @return {Promise<RemoveResult|FileError>} Returns a Promise that resolves to a RemoveResult or rejects with an error.
   */

  static removeDir(path: string, dirName: string): Promise<RemoveResult|FileError> {
    if ((/^\//.test(dirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getDirectory(fse, dirName, {create: false});
      })
      .then((de) => {
        return File.remove(de);
      });
  }

  /**
   * Move a directory to a given path.
   *
   * @param {string} path The source path to the directory
   * @param {string} dirName The source directory name
   * @param {string} newPath The destionation path to the directory
   * @param {string} newDirName The destination directory name
   * @return {Promise<DirectoryEntry|Entry|FileError>} Returns a Promise that resolves to the new DirectoryEntry object or rejects with an error.
   */

  static moveDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<DirectoryEntry|Entry|FileError> {
    newDirName = newDirName || dirName;

    if ((/^\//.test(newDirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return this.resolveDirectoryUrl(path)
      .then((fse) => {
        return this.getDirectory(fse, dirName, {create: false});
      })
      .then((srcde) => {
        return this.resolveDirectoryUrl(newPath)
          .then((deste) => {
            return File.move(srcde, deste, newDirName);
          });
      });
  }

  /**
   * Copy a directory in various methods. If destination directory exists, will fail to copy.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} dirName Name of directory to copy
   * @param {string} newPath Base FileSystem of new location
   * @param {string} newDirName New name of directory to copy to (leave blank to remain the same)
   * @return {Promise<Entry|FileError>} Returns a Promise that resolves to the new Entry object or rejects with an error.
   */
  static copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry|FileError> {
    if ((/^\//.test(newDirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return this.resolveDirectoryUrl(path)
      .then((fse) => {
        return this.getDirectory(fse, dirName, {create: false});
      })
      .then((srcde) => {
        return this.resolveDirectoryUrl(newPath)
          .then((deste) => {
            return File.copy(srcde, deste, newDirName);
          });
      });
  }

  /**
   * List files and directory from a given path.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} dirName Name of directory
   * @return {Promise<Entry[]>} Returns a Promise that resolves to an array of Entry objects or rejects with an error.
   */

  static listDir(path: string, dirName: string): Promise<Entry[]> {
    if ((/^\//.test(dirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<Entry[]>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getDirectory(fse, dirName, {create: false, exclusive: false});
      })
      .then((de) => {
        let reader = de.createReader();
        return File.readEntries(reader);
      });
  }

  /**
   * Removes all files and the directory from a desired location.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} dirName Name of directory
   * @return {Promise<RemoveResult>} Returns a Promise that resolves with a RemoveResult or rejects with an error.
   */

  static removeRecursively(path: string, dirName: string): Promise<RemoveResult> {
    if ((/^\//.test(dirName))) {
      let err = new FileError(5);
      err.message = 'directory cannot start with \/';
      return Promise.reject<RemoveResult>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getDirectory(fse, dirName, {create: false});
      })
      .then((de) => {
        return File.rimraf(de);
      });
  }

  /**
   * Check if a file exists in a certain path, directory.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} file Name of file to check
   * @return {Promise<boolean|FileError>} Returns a Promise that resolves with a boolean or rejects with an error.
   */

  static checkFile(path: string, file: string): Promise<boolean|FileError> {
    if ((/^\//.test(file))) {
      let err = new FileError(5);
      err.message = 'file cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveLocalFilesystemUrl(path + file)
      .then((fse) => {
        if (fse.isFile) {
          return true;
        } else {
          let err = new FileError(13);
          err.message = 'input is not a file';
          return Promise.reject<boolean>(err);
        }
      });
  }

  /**
   * Creates a new file in the specific path.
   * The replace boolean value determines whether to replace an existing file with the same name.
   * If an existing file exists and the replace value is false, the promise will fail and return an error.
   *
   * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName Name of file to create
   * @param {boolean} replace If true, replaces file with same name. If false returns error
   * @return {Promise<FileEntry|FileError>} Returns a Promise that resolves to a FileEntry or rejects with an error.
   */
  static createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry|FileError> {
    if ((/^\//.test(fileName))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    let options: Flags = {
      create: true
    };

    if (!replace) {
      options.exclusive = true;
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, fileName, options);
      });
  }

  /**
   * Removes a file from a desired location.
   *
   * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName Name of file to remove
   * @return {Promise<RemoveResult|FileError>} Returns a Promise that resolves to a RemoveResult or rejects with an error.
   */

  static removeFile(path: string, fileName: string): Promise<RemoveResult|FileError> {
    if ((/^\//.test(fileName))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, fileName, {create: false});
      })
      .then((fe) => {
        return File.remove(fe);
      });
  }

  /** Write a new file to the desired location.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName path relative to base path
   * @param {string} text content to write
   * @param {boolean | WriteOptions} replaceOrOptions replace file if set to true. See WriteOptions for more information.
   * @returns {Promise<void>} Returns a Promise that resolves or rejects with an error.
   */
  static writeFile(path: string, fileName: string,
                   text: string, replaceOrOptions: boolean | WriteOptions): Promise<void> {
    if ((/^\//.test(fileName))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject(err);
    }

    let opts: WriteOptions = {};
    if (replaceOrOptions) {
      if (typeof(replaceOrOptions) === 'boolean') {
        opts.replace = <boolean>replaceOrOptions;
      }
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, fileName, opts);
      })
      .then((fe) => {
        return File.createWriter(fe);
      })
      .then((writer) => {
        if (opts.append) {
          writer.seek(writer.length);
        }

        if (opts.hasOwnProperty('truncate')) {
          writer.truncate(opts.truncate);
        }

        return File.write(writer, text);
      });
  }

  /** Write to an existing file.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName path relative to base path
   * @param {string} text content to write
   * @returns {Promise<void>} Returns a Promise that resolves or rejects with an error.
   */
  static writeExistingFile(path: string, fileName: string, text: string): Promise<void> {
    if ((/^\//.test(fileName))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, fileName, {create: false});
      })
      .then((fe) => {
        return File.createWriter(fe);
      })
      .then((writer) => {
        return File.write(writer, text);
      });
  }

  /**
   * Read the contents of a file as text.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} file Name of file, relative to path.
   * @return {Promise<string|FileError>} Returns a Promise that resolves with the contents of the file as string or rejects with an error.
   */
  static readAsText(path: string, file: string): Promise<string|FileError> {
    if ((/^\//.test(file))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, file, {create: false});
      })
      .then((fe) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result !== undefined || reader.result !== null) {
              resolve(reader.result);
            } else if (reader.error !== undefined || reader.error !== null) {
              reject(reader.error);
            } else {
              reject({code: null, message: 'READER_ONLOADEND_ERR'});
            }
          };

          reader.readAsText(fe);
        });
      });
  }
  /**
   * Read file and return data as a base64 encoded data url.
   * A data url is of the form:
   *      data:[<mediatype>][;base64],<data>

   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} file Name of file, relative to path.
   * @return {Promise<string|FileError>} Returns a Promise that resolves with the contents of the file as data URL or rejects with an error.
   */
  static readAsDataURL(path: string, file: string): Promise<string|FileError> {
    if ((/^\//.test(file))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, file, {create: false});
      })
      .then((fe) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result !== undefined || reader.result !== null) {
              resolve(reader.result);
            } else if (reader.error !== undefined || reader.error !== null) {
              reject(reader.error);
            } else {
              reject({code: null, message: 'READER_ONLOADEND_ERR'});
            }
          };

          reader.readAsDataURL(fe);
        });
      });
  }

  /**
   * Read file and return data as a binary data.

   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} file Name of file, relative to path.
   * @return {Promise<string|FileError>} Returns a Promise that resolves with the contents of the file as string rejects with an error.
   */
  static readAsBinaryString(path: string, file: string): Promise<string|FileError> {
    if ((/^\//.test(file))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, file, {create: false});
      })
      .then((fe) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result !== undefined || reader.result !== null) {
              resolve(reader.result);
            } else if (reader.error !== undefined || reader.error !== null) {
              reject(reader.error);
            } else {
              reject({code: null, message: 'READER_ONLOADEND_ERR'});
            }
          };

          reader.readAsBinaryString(fe);
        });
      });
  }

  /**
   * Read file and return data as an ArrayBuffer.

   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} file Name of file, relative to path.
   * @return {Promise<ArrayBuffer|FileError>} Returns a Promise that resolves with the contents of the file as ArrayBuffer or rejects with an error.
   */
  static readAsArrayBuffer(path: string, file: string): Promise<ArrayBuffer|FileError> {
    if ((/^\//.test(file))) {
      let err = new FileError(5);
      err.message = 'file-name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return File.resolveDirectoryUrl(path)
      .then((fse) => {
        return File.getFile(fse, file, {create: false});
      })
      .then((fe) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result !== undefined || reader.result !== null) {
              resolve(reader.result);
            } else if (reader.error !== undefined || reader.error !== null) {
              reject(reader.error);
            } else {
              reject({code: null, message: 'READER_ONLOADEND_ERR'});
            }
          };

          reader.readAsArrayBuffer(fe);
        });
      });
  }

  /**
   * Move a file to a given path.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName Name of file to move
   * @param {string} newPath Base FileSystem of new location
   * @param {string} newFileName New name of file to move to (leave blank to remain the same)
   * @return {Promise<Entry|FileError>} Returns a Promise that resolves to the new Entry or rejects with an error.
   */
  static moveFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry|FileError> {
    newFileName = newFileName || fileName;

    if ((/^\//.test(newFileName))) {
      let err = new FileError(5);
      err.message = 'file name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return this.resolveDirectoryUrl(path)
      .then((fse) => {
        return this.getFile(fse, fileName, {create: false});
      })
      .then((srcfe) => {
        return this.resolveDirectoryUrl(newPath)
          .then((deste) => {
            return File.move(srcfe, deste, newFileName);
          });
      });
  }

  /**
   * Copy a file in various methods. If file exists, will fail to copy.
   *
   * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
   * @param {string} fileName Name of file to copy
   * @param {string} newPath Base FileSystem of new location
   * @param {string} newFileName New name of file to copy to (leave blank to remain the same)
   * @return {Promise<Entry|FileError>} Returns a Promise that resolves to an Entry or rejects with an error.
   */
  static copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry|FileError> {
    newFileName = newFileName || fileName;

    if ((/^\//.test(newFileName))) {
      let err = new FileError(5);
      err.message = 'file name cannot start with \/';
      return Promise.reject<FileError>(err);
    }

    return this.resolveDirectoryUrl(path)
      .then((fse) => {
        return this.getFile(fse, fileName, {create: false});
      })
      .then((srcfe) => {
        return this.resolveDirectoryUrl(newPath)
          .then((deste) => {
            return File.copy(srcfe, deste, newFileName);
          });
      });
  }

  // these private methods help avoid cascading error handling
  // in the public ones, primarily simply wrapping callback
  // operations to return Promises that can then be chained.

  private static fillErrorMessage(err: FileError): void {
    err.message = File.cordovaFileError[err.code];
  }

  private static resolveLocalFilesystemUrl(furl: string): Promise<Entry> {
    return new Promise((resolve, reject) => {
      try {
        window.resolveLocalFileSystemURL(furl, (entry) => {
          resolve(entry);
        }, (err) => {
          File.fillErrorMessage(err);
          reject(err);
        });
      } catch (xc) {
        File.fillErrorMessage(xc);
        reject(xc);
      }
    });
  }

  private static resolveDirectoryUrl(durl: string): Promise<DirectoryEntry> {
    return File.resolveLocalFilesystemUrl(durl)
      .then((de) => {
        if (de.isDirectory) {
          return <DirectoryEntry>de;
        } else {
          let err = new FileError(13);
          err.message = 'input is not a directory';
          return Promise.reject<DirectoryEntry>(err);
        }
      });
  }

  private static getDirectory(fse: DirectoryEntry, dn: string, flags: Flags): Promise<DirectoryEntry> {
    return new Promise((resolve, reject) => {
      try {
        fse.getDirectory(dn, flags, (de) => {
          resolve(de);
        }, (err) => {
          File.fillErrorMessage(err);
          reject(err);
        });
      } catch (xc) {
        File.fillErrorMessage(xc);
        reject(xc);
      }
    });
  }

  private static getFile(fse: DirectoryEntry, fn: string, flags: Flags): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      try {
        fse.getFile(fn, flags, (fe) => {
          resolve(fe);
        }, (err) => {
          File.fillErrorMessage(err);
          reject(err);
        });
      } catch (xc) {
        File.fillErrorMessage(xc);
        reject(xc);
      }
    });
  }

  private static remove(fe: Entry): Promise<RemoveResult> {
    return new Promise((resolve, reject) => {
      fe.remove(() => {
        resolve({success: true, fileRemoved: fe});
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static move(srce: Entry, destdir: DirectoryEntry, newName: string): Promise<Entry> {
    return new Promise((resolve, reject) => {
      srce.moveTo(destdir, newName, (deste) => {
        resolve(deste);
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static copy(srce: Entry, destdir: DirectoryEntry, newName: string): Promise<Entry> {
    return new Promise((resolve, reject) => {
      srce.copyTo(destdir, newName, (deste) => {
        resolve(deste);
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static readEntries(dr: DirectoryReader): Promise<Entry[]> {
    return new Promise((resolve, reject) => {
      dr.readEntries((entries) => {
        resolve(entries);
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static rimraf(de: DirectoryEntry): Promise<RemoveResult> {
    return new Promise((resolve, reject) => {
      de.removeRecursively(() => {
        resolve({success: true, fileRemoved: de});
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static createWriter(fe: FileEntry): Promise<FileWriter> {
    return new Promise((resolve, reject) => {
      fe.createWriter((writer) => {
        resolve(writer);
      }, (err) => {
        File.fillErrorMessage(err);
        reject(err);
      });
    });
  }

  private static write(writer: FileWriter, gu: string | Blob): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      writer.onwriteend = (evt) => {
        if (writer.error) {
          reject(writer.error);
        } else {
          resolve();
        }
      };
      writer.write(gu);
    });
  }
}
