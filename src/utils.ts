import type { ExportConfig, TargetConfig, Lang } from './types'
import fs from 'fs'
import path from 'path'
import { DataTypes, typeis } from 'typeof-plus'

const cwd = process.cwd()
export const getRootPath = (): string => cwd

export const defineConfig = (config: ExportConfig): ExportConfig => {
  return config
}

export const getFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8')
}

export const getFiles = (entry: string, deep: boolean): string[] => {
  const result: string[] = []
  const readDir = (entry: string): void => {
    const dirInfo = fs.readdirSync(entry)
    for (let j = 0; j < dirInfo.length; j++) {
      const item = dirInfo[j]
      const location = path.join(entry, item)
      const info = fs.statSync(location)
      if (info.isDirectory()) {
        deep && readDir(location)
      } else {
        result.push(getFile(location))
      }
    }
  }
  readDir(entry)
  return result
}

export const mergeJson = (
  json1: Record<string, any>,
  json2: Record<string, any>
): Record<string, any> => {
  for (const key in json2) {
    const val = json2[key]
    if (typeis(val) === DataTypes.object) {
      json1[key] = mergeJson(json1[key] ?? {}, val)
    } else {
      json1[key] = val
    }
  }
  return json1
}

export const filterJson = (
  json1: Record<string, any>,
  json2: Record<string, any>
): Record<string, any> => {
  const json: Record<string, any> = {}
  for (const key in json1) {
    if (typeis(json1[key]) === DataTypes.object) {
      const res = filterJson(json1[key], typeis(json2[key]) === DataTypes.object ? json2[key] : {})
      if (Object.keys(res).length > 0) {
        json[key] = res
      }
    } else if (json2[key] == null) {
      json[key] = json1[key]
    }
  }
  return json
}

export const isFilePath = (path: string): boolean => {
  return /(\.json|\.js|\.ts)$/.test(path)
}

export const getOutPath = (
  it: TargetConfig,
  duplicateRemovalEntries: string[],
  idx: number,
  entryPath: string
): string => {
  return isFilePath(it.outPath)
    ? typeof it.rewrite === 'function'
      ? path.join(
        getRootPath(),
        path.dirname(it.outPath),
        it.rewrite(path.basename(entryPath))
      )
      : path.join(getRootPath(), it.outPath)
    : typeof it.rewrite === 'function'
      ? path.join(
        getRootPath(),
        it.outPath,
        duplicateRemovalEntries[idx].includes('/')
          ? path.dirname(duplicateRemovalEntries[idx])
          : '',
        it.rewrite(path.basename(entryPath))
      )
      : path.join(getRootPath(), it.outPath, duplicateRemovalEntries[idx])
}

/**
 * @see https://fanyi-api.baidu.com/api/trans/product/apidoc#languageList
 */
const baiduLangConfig = new Map([
  ['auto', 'auto'],
  ['zh-CN', 'zh'],
  ['en', 'en'],
  ['yue', 'yue'],
  ['ms', 'may'],
  ['wyw', 'wyw'],
  ['fa', 'per'],
  ['ja', 'jp'],
  ['ko', 'kor'],
  ['fr', 'fra'],
  ['es', 'spa'],
  ['th', 'th'],
  ['ar', 'ara'],
  ['ru', 'ru'],
  ['pt', 'pt'],
  ['de', 'de'],
  ['it', 'it'],
  ['el', 'el'],
  ['nl', 'nl'],
  ['pl', 'pl'],
  ['bg', 'bul'],
  ['et', 'est'],
  ['da', 'dan'],
  ['fi', 'fin'],
  ['cs', 'cs'],
  ['ro', 'rom'],
  ['sl', 'slo'],
  ['sv', 'swe'],
  ['hu', 'hu'],
  ['zh-TW', 'cht'],
  ['vi', 'vie'],
  ['iw', 'heb'],
  ['sr', 'srp']
])
export const getBaiduLangCode: (lang: Lang) => Lang = (lang: Lang) => {
  return (baiduLangConfig.get(lang) ?? lang) as Lang
}

export const splitJson = (json: Record<string, any>): Array<Record<string, any>> => {
  const result = []
  for (const key in json) {
    const value = json[key]
    if (typeis(value) === DataTypes.object) {
      const subResult = splitJson(value)
      for (const subObj of subResult) {
        result.push({ [key]: subObj })
      }
    } else {
      result.push({ [key]: value })
    }
  }
  return result
}

export const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, string> => {
  let result: Record<string, string> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const nestedKey = prefix.length > 0 ? `${prefix}/${key}` : key
      if (typeis(obj[key]) === DataTypes.object) {
        const nestedObj = flattenObject(obj[key], nestedKey)
        result = { ...result, ...nestedObj }
      } else {
        result[nestedKey] = obj[key]
      }
    }
  }
  return result
}

export const unflattenObject = (obj: Record<string, string>): Record<string, any> => {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const nestedKeys = key.split('/')
      let nestedObj = result
      for (let i = 0; i < nestedKeys.length; i++) {
        const nestedKey = nestedKeys[i]
        if (!Object.prototype.hasOwnProperty.call(nestedObj, nestedKey)) {
          nestedObj[nestedKey] = {}
        }
        if (i === nestedKeys.length - 1) {
          nestedObj[nestedKey] = obj[key]
        }
        nestedObj = nestedObj[nestedKey]
      }
    }
  }
  return result
}

export const consoleSuccess = (...msg: string[]): void => { console.log('\x1b[32m%s\x1b[0m', ...msg) }

export const consoleLog = (...msg: string[]): void => { console.log('\x1b[34m%s\x1b[0m', ...msg) }

export const consoleWarn = (...msg: string[]): void => { console.log('\x1b[33m%s\x1b[0m', ...msg) }

export const consoleError = (...msg: string[]): void => { console.log('\x1b[31m%s\x1b[0m', ...msg) }
