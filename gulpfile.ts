import gulp from 'gulp';
import * as dotax from 'gulp-dotax';
import path from 'path';

const paths: { [key: string]: string } = {
    excels: 'excels',
    kv: 'game/scripts/npc',
    src_json: 'game/scripts/src/json',
    panorama_json: 'content/panorama/src/json',
    panorama: 'content/panorama',
    game_resource: 'game/resource',
};

/**
 * @description 将excel文件转换为kv文件
 * @description Convert your excel file to kv file
 */
const sheet_2_kv =
    (watch: boolean = false) =>
    () => {
        const excelFiles = `${paths.excels}/**/*.{xlsx,xls}`;
        const transpileSheets = () => {
            return gulp
                .src(excelFiles)
                .pipe(
                    dotax.sheetToKV({
                        // 所有支持的参数请按住 Ctrl 点击 sheetToKV 查看，以下其他 API 也是如此
                        sheetsIgnore: '^__.*|^Sheet[1-3]$', // 忽略以两个下划线开头的sheet 和 默认生成的 Sheet1 Sheet2 Sheet3 等
                        indent: `	`, // 自定义缩进
                        addonCSVPath: `${paths.game_resource}/addon.csv`, // 本地化文件路径，用以将 excel 文件中的 #Loc{}输出到addon.csv文件中去
                    })
                )
                .pipe(gulp.dest(paths.kv));
        };

        if (watch) {
            return gulp.watch(excelFiles, transpileSheets);
        } else {
            return transpileSheets();
        }
    };

/**
 * @description 将kv文件转换为panorama使用的json文件
 * @description Convert your kv file to panorama json file
 */
const kv_2_js =
    (watch: boolean = false) =>
    () => {
        const kvFiles = `${paths.kv}/**/*.{kv,txt}`;
        const transpileKVToJS = () => {
            return gulp.src(kvFiles).pipe(dotax.kvToJS()).pipe(gulp.dest(paths.panorama_json)).pipe(gulp.dest(paths.src_json));
        };

        if (watch) {
            return gulp.watch(kvFiles, transpileKVToJS);
        } else {
            return transpileKVToJS();
        }
    };

/**
 * @description 从 kv 文件中提取所有需要的本地化词条，你可以使用 customPrefix 和 customSuffix 之类的参数来指定自己的前缀和后缀
 * @description Extract all description from kv file, you can use customPrefix and customSuffix to specify your prefix and suffix
 */
const kv_to_local = () => () => {
    return gulp.src(`${paths.kv}/**/*.{kv,txt}`).pipe(
        dotax.kvToLocalsCSV(`${paths.game_resource}/addon.csv`, {
            // customPrefix: (key, data, path) => {
            //     if (data.BaseClass && /ability_/.test(data.BaseClass)) {
            //         if (data.ScriptFile && data.ScriptFile.startsWith('abilities/combos/')) {
            //             return 'dota_tooltip_ability_combo_';
            //         } else if (data.ScriptFile && /^/.test(data.ScriptFile)) {
            //             return 'dota_tooltip_ability_chess_ability_';
            //         } else {
            //             return 'dota_tooltip_ability_';
            //         }
            //     }
            //     return '';
            // },
            // customSuffix: (key, data, path) => {
            //     let suffix = [''];
            //     if (data.ScriptFile && data.ScriptFile.startsWith('abilities/combos/')) {
            //         suffix = ['_description'];
            //         let maxLevel = data.MaxLevel;
            //         if (maxLevel) {
            //             suffix = suffix.concat(
            //                 Array.from({ length: maxLevel }, (_, i) => `_level${i + 1}`)
            //             );
            //         }
            //     }
            //     return suffix;
            // },
            // exportAbilityValues: false,
        })
    );
};

/**
 * @description 将 addon.csv 中的本地化文本转换为 addon_*.txt 文件
 * @description Convert addon.csv local text to addon_*.txt file
 *
 */
const csv_to_localization =
    (watch: boolean = false) =>
    () => {
        const addonCsv = `${paths.game_resource}/*.csv`;
        const transpileAddonCSVToLocalization = () => {
            return gulp.src(addonCsv).pipe(dotax.csvToLocals(paths.game_resource));
        };
        if (watch) {
            return gulp.watch(addonCsv, transpileAddonCSVToLocalization);
        } else {
            return transpileAddonCSVToLocalization();
        }
    };

/**
 * @description 将现有的 addon_*.txt 文件转换为 addon.csv 文件，这个 task 是为了使这个task适配你原有的开发方式，如果是重新开发，则无需运行这个task
 * @description Convert addon_*.txt file to addon.csv file, this task is for adapting your original development method, if you are re-developing, you don't need to run this task
 */
const localization_2_csv = () => {
    return dotax.localsToCSV(`${paths.game_resource}/addon_*.txt`, `${paths.game_resource}/addon.csv`);
};
/**
 * @description 根據 shared/net_tables.d.ts 中的類型定義，自動生成 game/scripts/custom_net_tables.txt 聲明文件
 * @description Automatically generate game/scripts/custom_net_tables.txt from type definitions in shared/net_tables.d.ts
 */
const generate_custom_net_tables =
    (watch: boolean = false) =>
    (done: Function) => {
        const typeDefFile = `shared/net_tables.d.ts`;
        const outputFile = `game/scripts/custom_net_tables.txt`;

        const generateFile = (callback: Function) => {
            const fs = require('fs');
            const path = require('path');
            
            try {
                const typeDefPath = path.resolve(typeDefFile);
                let typeDefContent = fs.readFileSync(typeDefPath, 'utf-8');

                // 1. 移除註釋，避免干擾匹配
                typeDefContent = typeDefContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
                
                // 2. 匹配所有頂層屬性定義
                const tableRegex = /^\s*(\w+)\s*:\s*\{/gm;
                const tables: string[] = [];
                let match;
                
                tableRegex.lastIndex = 0;
                
                while ((match = tableRegex.exec(typeDefContent)) !== null) {
                    const tableName = match[1];
                    // 過濾掉明顯不是表名的關鍵字
                    if (!['interface', 'declare', 'type', 'export', 'import'].includes(tableName.toLowerCase())) {
                        tables.push(tableName);
                    }
                }
                
                // 去重
                const uniqueTables = [...new Set(tables)];

                if (uniqueTables.length === 0) {
                    console.warn(`⚠️  [generate_custom_net_tables] 在 ${typeDefFile} 中未找到任何網絡表定義。`);
                }

               // 3. 生成 KV3 格式內容（根據您提供的示例格式）
                // 首先將表名轉換為小寫並用下劃線分隔
                const kvTableNames = uniqueTables.map(tableName => 
                    tableName
                        .replace(/Table$/, '')
                        .replace(/([a-z])([A-Z])/g, '$1_$2')
                        .toLowerCase()
                );

                // 構建 KV3 格式內容
                const kvContent = `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
                {
                custom_net_tables = 
                [
                ${kvTableNames.map(name => `        "${name}"`).join(',\n')}
                    ]
                }`;

                // 4. 寫入文件
                const outputPath = path.resolve(outputFile);
                fs.writeFileSync(outputPath, kvContent, 'utf-8');
                console.log(`✅ [generate_custom_net_tables] 已生成 ${outputPath}，包含表: ${kvTableNames.join(', ')}`);
                callback();
            } catch (error) {
                console.error(`❌ [generate_custom_net_tables] 生成失敗:`, error);
                callback(error);
            }
        };

        if (watch) {
            const watcher = gulp.watch(typeDefFile, () => {
                generateFile((err: any) => {
                    if (err) {
                        console.error('監聽模式生成失敗:', err);
                    }
                });
            });
            generateFile(done);
            return watcher;
        } else {
            generateFile(done);
        }
    };
/**
 * 将panorama/images目录下的jpg,png,psd文件集合到 dest 目录中的 image_precache.css文件中
 * 使用这个 task ，你可以在 game setup 阶段的时候，将所有的图片都编译而不用自己写
 */
const create_image_precache =
    (watch: boolean = false) =>
    () => {
        const imageFiles = `${paths.panorama}/images/**/*.{jpg,png,psd}`;
        const createImagePrecache = () => {
            return gulp.src(imageFiles).pipe(dotax.imagePrecacche(`content/panorama/images/`)).pipe(gulp.dest(paths.panorama));
        };
        if (watch) {
            return gulp.watch(imageFiles, createImagePrecache);
        } else {
            return createImagePrecache();
        }
    };

/**
 * start a file sserver to save/read files
 */
const fsServer = require('./scripts/fs');
const p = process.cwd();
const start_file_server = (callback: Function) => {
    const server = fsServer(p);

    server.on('file', (name: string) => {
        console.log('file: ' + name);
    });
    server.on('directory', (name: string) => {
        console.log('directory: ' + name);
    });

    server.listen(10384, () => {
        console.log('file server listening on port 10384');
        callback();
    });
};

gulp.task('start_file_server', start_file_server);

gulp.task('localization_2_csv', localization_2_csv);

gulp.task(`create_image_precache`, create_image_precache());
gulp.task('create_image_precache:watch', create_image_precache(true));

gulp.task('sheet_2_kv', sheet_2_kv());
gulp.task('sheet_2_kv:watch', sheet_2_kv(true));

gulp.task('kv_2_js', kv_2_js());
gulp.task('kv_2_js:watch', kv_2_js(true));

gulp.task('csv_to_localization', csv_to_localization());
gulp.task('csv_to_localization:watch', csv_to_localization(true));

// ========== 新增的兩個任務註冊 ==========
gulp.task('generate_custom_net_tables', generate_custom_net_tables());
gulp.task('generate_custom_net_tables:watch', generate_custom_net_tables(true));

gulp.task('predev', gulp.series('sheet_2_kv', 'kv_2_js', 'generate_custom_net_tables','csv_to_localization', 'create_image_precache'));
gulp.task('dev', gulp.parallel('sheet_2_kv:watch', 'csv_to_localization:watch', 'create_image_precache:watch', 'kv_2_js:watch', 'generate_custom_net_tables:watch'));
gulp.task('build', gulp.series('predev'));
gulp.task('jssync', gulp.series('sheet_2_kv', 'kv_2_js'));
gulp.task('kv_to_local', kv_to_local());
gulp.task('prod', gulp.series('predev'));
