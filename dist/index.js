#!/usr/bin/env node
(()=>{var e={126:(e,t,r)=>{var s=r(147);var o;if(process.platform==="win32"||global.TESTING_WINDOWS){o=r(1)}else{o=r(728)}e.exports=isexe;isexe.sync=sync;function isexe(e,t,r){if(typeof t==="function"){r=t;t={}}if(!r){if(typeof Promise!=="function"){throw new TypeError("callback not provided")}return new Promise((function(r,s){isexe(e,t||{},(function(e,t){if(e){s(e)}else{r(t)}}))}))}o(e,t||{},(function(e,s){if(e){if(e.code==="EACCES"||t&&t.ignoreErrors){e=null;s=false}}r(e,s)}))}function sync(e,t){try{return o.sync(e,t||{})}catch(e){if(t&&t.ignoreErrors||e.code==="EACCES"){return false}else{throw e}}}},728:(e,t,r)=>{e.exports=isexe;isexe.sync=sync;var s=r(147);function isexe(e,t,r){s.stat(e,(function(e,s){r(e,e?false:checkStat(s,t))}))}function sync(e,t){return checkStat(s.statSync(e),t)}function checkStat(e,t){return e.isFile()&&checkMode(e,t)}function checkMode(e,t){var r=e.mode;var s=e.uid;var o=e.gid;var n=t.uid!==undefined?t.uid:process.getuid&&process.getuid();var c=t.gid!==undefined?t.gid:process.getgid&&process.getgid();var i=parseInt("100",8);var a=parseInt("010",8);var u=parseInt("001",8);var l=i|a;var f=r&u||r&a&&o===c||r&i&&s===n||r&l&&n===0;return f}},1:(e,t,r)=>{e.exports=isexe;isexe.sync=sync;var s=r(147);function checkPathExt(e,t){var r=t.pathExt!==undefined?t.pathExt:process.env.PATHEXT;if(!r){return true}r=r.split(";");if(r.indexOf("")!==-1){return true}for(var s=0;s<r.length;s++){var o=r[s].toLowerCase();if(o&&e.substr(-o.length).toLowerCase()===o){return true}}return false}function checkStat(e,t,r){if(!e.isSymbolicLink()&&!e.isFile()){return false}return checkPathExt(t,r)}function isexe(e,t,r){s.stat(e,(function(s,o){r(s,s?false:checkStat(o,e,t))}))}function sync(e,t){return checkStat(s.statSync(e),e,t)}},898:(e,t,r)=>{"use strict";var s=r(81).spawn;var o=r(837);var escapeSpaces=function(e){if(typeof e==="string"){return e.replace(/\b\s/g,"\\ ")}else{return e}};var escapeSpacesInOptions=function(e){["src","dest","include","exclude","excludeFirst"].forEach((function(t){var r=e[t];if(typeof r==="string"){e[t]=escapeSpaces(r)}else if(Array.isArray(r)===true){e[t]=r.map(escapeSpaces)}}));return e};e.exports=function(e,t){e=e||{};e=o._extend({},e);e=escapeSpacesInOptions(e);var r=e.platform||process.platform;var n=r==="win32";if(typeof e.src==="undefined"){throw new Error("'src' directory is missing from options")}if(typeof e.dest==="undefined"){throw new Error("'dest' directory is missing from options")}var c=e.dest;if(typeof e.host!=="undefined"){c=e.host+":"+e.dest}if(!Array.isArray(e.src)){e.src=[e.src]}var i=[].concat(e.src);i.push(c);var a=(e.args||[]).find((function(e){return e.match(/--chmod=/)}));if(n&&!a){i.push("--chmod=ugo=rwX")}if(typeof e.host!=="undefined"||e.ssh){i.push("--rsh");var u="ssh";if(typeof e.port!=="undefined"){u+=" -p "+e.port}if(typeof e.privateKey!=="undefined"){u+=" -i "+e.privateKey}if(typeof e.sshCmdArgs!=="undefined"){u+=" "+e.sshCmdArgs.join(" ")}i.push(u)}if(e.recursive===true){i.push("--recursive")}if(e.times===true){i.push("--times")}if(e.syncDest===true||e.deleteAll===true){i.push("--delete");i.push("--delete-excluded")}if(e.syncDestIgnoreExcl===true||e.delete===true){i.push("--delete")}if(e.dryRun===true){i.push("--dry-run");i.push("--verbose")}if(typeof e.excludeFirst!=="undefined"&&o.isArray(e.excludeFirst)){e.excludeFirst.forEach((function(e,t){i.push("--exclude="+e)}))}if(typeof e.include!=="undefined"&&o.isArray(e.include)){e.include.forEach((function(e,t){i.push("--include="+e)}))}if(typeof e.exclude!=="undefined"&&o.isArray(e.exclude)){e.exclude.forEach((function(e,t){i.push("--exclude="+e)}))}switch(e.compareMode){case"sizeOnly":i.push("--size-only");break;case"checksum":i.push("--checksum");break}if(typeof e.args!=="undefined"&&o.isArray(e.args)){i=[...new Set([...i,...e.args])]}i=[...new Set(i)];var noop=function(){};var l=e.onStdout||noop;var f=e.onStderr||noop;var d="rsync ";i.forEach((function(e){if(e.substr(0,4)==="ssh "){e='"'+e+'"'}d+=e+" "}));d=d.trim();if(e.noExec){t(null,null,null,d);return}try{var p="";var h="";var y;if(n){y=s("cmd.exe",["/s","/c",'"'+d+'"'],{windowsVerbatimArguments:true,stdio:[process.stdin,"pipe","pipe"]})}else{y=s("/bin/sh",["-c",d])}y.stdout.on("data",(function(e){l(e);p+=e}));y.stderr.on("data",(function(e){f(e);h+=e}));y.on("exit",(function(e){var r=null;if(e!==0){r=new Error("rsync exited with code "+e);r.code=e}t(r,p,h,d)}))}catch(e){t(e,null,null,d)}}},143:(e,t,r)=>{const s=r(126);const{join:o,delimiter:n,sep:c,posix:i}=r(17);const a=process.platform==="win32";const u=new RegExp(`[${i.sep}${c===i.sep?"":c}]`.replace(/(\\)/g,"\\$1"));const l=new RegExp(`^\\.${u.source}`);const getNotFoundError=e=>Object.assign(new Error(`not found: ${e}`),{code:"ENOENT"});const getPathInfo=(e,{path:t=process.env.PATH,pathExt:r=process.env.PATHEXT,delimiter:s=n})=>{const o=e.match(u)?[""]:[...a?[process.cwd()]:[],...(t||"").split(s)];if(a){const t=r||[".EXE",".CMD",".BAT",".COM"].join(s);const n=t.split(s);if(e.includes(".")&&n[0]!==""){n.unshift("")}return{pathEnv:o,pathExt:n,pathExtExe:t}}return{pathEnv:o,pathExt:[""]}};const getPathPart=(e,t)=>{const r=/^".*"$/.test(e)?e.slice(1,-1):e;const s=!r&&l.test(t)?t.slice(0,2):"";return s+o(r,t)};const which=async(e,t={})=>{const{pathEnv:r,pathExt:o,pathExtExe:n}=getPathInfo(e,t);const c=[];for(const i of r){const r=getPathPart(i,e);for(const e of o){const o=r+e;const i=await s(o,{pathExt:n,ignoreErrors:true});if(i){if(!t.all){return o}c.push(o)}}}if(t.all&&c.length){return c}if(t.nothrow){return null}throw getNotFoundError(e)};const whichSync=(e,t={})=>{const{pathEnv:r,pathExt:o,pathExtExe:n}=getPathInfo(e,t);const c=[];for(const i of r){const r=getPathPart(i,e);for(const e of o){const o=r+e;const i=s.sync(o,{pathExt:n,ignoreErrors:true});if(i){if(!t.all){return o}c.push(o)}}}if(t.all&&c.length){return c}if(t.nothrow){return null}throw getNotFoundError(e)};e.exports=which;which.sync=whichSync},505:(e,t,r)=>{const{existsSync:s,mkdirSync:o,writeFileSync:n}=r(147);const{join:c}=r(17);const validateDir=e=>{if(s(e)){console.log(`[SSH] ${e} dir exist`);return}console.log(`[SSH] Creating ${e} dir in workspace root`);o(e);console.log("✅ [SSH] dir created.")};const writeToFile=({dir:e,filename:t,content:r,isRequired:o})=>{validateDir(e);const i=c(e,t);if(s(i)){console.log(`[FILE] ${i} file exist`);if(o){throw new Error(`⚠️ [FILE] ${i} Required file exist, aborting ...`)}return}try{n(i,r,{encoding:"utf8",mode:384})}catch(e){throw new Error(`⚠️[FILE] Writing to file error. filePath: ${i}, message:  ${e.message}`)}};const validateRequiredInputs=e=>{const t=Object.keys(e);const r=t.filter((t=>{const r=e[t];if(!r){console.error(`⚠️ [INPUTS] ${t} is mandatory`)}return r}));if(r.length!==t.length){throw new Error("⚠️ [INPUTS] Inputs not valid, aborting ...")}};const snakeToCamel=e=>e.replace(/[^a-zA-Z0-9]+(.)/g,((e,t)=>t.toUpperCase()));e.exports={writeToFile:writeToFile,validateRequiredInputs:validateRequiredInputs,snakeToCamel:snakeToCamel}},229:(e,t,r)=>{const{snakeToCamel:s}=r(505);const o=["REMOTE_HOST","REMOTE_USER","REMOTE_PORT","SSH_PRIVATE_KEY","DEPLOY_KEY_NAME","SOURCE","TARGET","ARGS","EXCLUDE","SCRIPT_BEFORE","SCRIPT_AFTER"];const n=process.env.GITHUB_WORKSPACE;const c=process.env.REMOTE_USER;const i={source:"",target:`/home/${c}/`,exclude:"",args:"-rltgoDzvO",deployKeyName:"deploy_key"};const a={githubWorkspace:n};o.forEach((e=>{const t=s(e.toLowerCase());const r=process.env[e]||process.env[`INPUT_${e}`];const o=r===undefined?i[t]:r;let c=o;switch(t){case"source":c=`${n}/${o}`;break;case"exclude":c=o.split(",").map((e=>e.trim()));break;case"args":c=[o];break}a[t]=c}));a.sshServer=`${a.remoteUser}@${a.remoteHost}:${a.target}`;e.exports=a},976:(e,t,r)=>{const{join:s}=r(17);const{exec:o}=r(81);const{sshServer:n,githubWorkspace:c}=r(229);const{writeToFile:i}=r(505);const remoteCmd=(e,t)=>{const r=s(c,`local_ssh_script-${t}.sh`);try{i(r,e);o(`ssh ${n} 'bash -s' < ${r}`,((e,t,r)=>{if(e){console.log("⚠️ [CMD] Remote script failed. ",e.message)}else{console.log("✅ [CMD] Remote script executed. \n",t,r)}}))}catch(e){console.log("⚠️ [CMD] Starting Remote script execution failed. ",e.message)}};e.exports={remoteCmdBefore:e=>remoteCmd(e,"before"),remoteCmdAfter:e=>remoteCmd(e,"after")}},447:(e,t,r)=>{const{execSync:s}=r(81);const o=r(143);const n=r(898);const validateRsync=async()=>{const e=await o("rsync",{nothrow:true});s("rsync --version",{stdio:"inherit"});if(e){console.log("⚠️ [CLI] Rsync exists");s("rsync --version",{stdio:"inherit"});return}console.log('⚠️ [CLI] Rsync doesn\'t exists. Start installation with "apt-get" \n');try{s("sudo apt-get update && sudo apt-get --no-install-recommends install rsync",{stdio:"inherit"});console.log("✅ [CLI] Rsync installed. \n")}catch(e){throw new Error(`⚠️ [CLI] Rsync installation failed. Aborting ... error: ${e.message}`)}};const rsyncCli=({source:e,sshServer:t,exclude:r,remotePort:s,privateKey:o,args:c,callback:i})=>{console.log(`[Rsync] Starting Rsync Action: ${e} to ${t}`);if(r)console.log(`[Rsync] excluding folders ${r}`);const a={ssh:true,sshCmdArgs:["-o StrictHostKeyChecking=no"],recursive:true};try{n({src:e,dest:t,excludeFirst:r,port:s,privateKey:o,args:c,callback:i,...a},((e,t,r,s)=>{if(e){console.error("⚠️ [Rsync] error: ",e.message);console.log("⚠️ [Rsync] stderr: ",r);console.log("⚠️ [Rsync] stdout: ",t);console.log("⚠️ [Rsync] cmd: ",s)}else{console.log("✅ [Rsync] finished.",t)}i(e,t,r,s);if(e){process.abort()}}))}catch(e){console.error("⚠️ [Rsync] command error: ",e.message,e.stack);process.abort()}};const sshDeploy=e=>{validateRsync.then((()=>{rsyncCli(e)})).catch((e=>{throw e}))};e.exports={sshDeploy:sshDeploy}},822:(e,t,r)=>{const{join:s}=r(17);const{writeToFile:o}=r(505);const addSshKey=(e,t)=>{const{HOME:r}=process.env;const n=s(r||__dirname,".ssh");const c=s(n,t);o({dir:n,filename:"known_hosts",content:""});o({dir:n,filename:t,content:e,isRequired:true});console.log("✅ Ssh key added to `.ssh` dir ",n);return c};e.exports={addSshKey:addSshKey}},81:e=>{"use strict";e.exports=require("child_process")},147:e=>{"use strict";e.exports=require("fs")},17:e=>{"use strict";e.exports=require("path")},837:e=>{"use strict";e.exports=require("util")}};var t={};function __nccwpck_require__(r){var s=t[r];if(s!==undefined){return s.exports}var o=t[r]={exports:{}};var n=true;try{e[r](o,o.exports,__nccwpck_require__);n=false}finally{if(n)delete t[r]}return o.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r={};(()=>{const{sshDeploy:e}=__nccwpck_require__(447);const{remoteCmdBefore:t,remoteCmdAfter:r}=__nccwpck_require__(976);const{addSshKey:s}=__nccwpck_require__(822);const{validateRequiredInputs:o}=__nccwpck_require__(505);const n=__nccwpck_require__(229);const run=()=>{const{source:c,remoteUser:i,remoteHost:a,remotePort:u,deployKeyName:l,sshPrivateKey:f,args:d,exclude:p,scriptBefore:h,scriptAfter:y,sshServer:g}=n;o({sshPrivateKey:f,remoteHost:a,remoteUser:i});const x=s(f,l);if(h){t(h)}let callback=()=>{};if(y){callback=(...e)=>{r(y,e)}}e({source:c,sshServer:g,exclude:p,remotePort:u,privateKey:x,args:d,callback:callback})};run()})();module.exports=r})();