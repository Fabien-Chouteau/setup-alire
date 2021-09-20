import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

import path from "path";

const install_dir : string = "alire_install";

async function install_branch(branch : string) {
    const repo_url  : string = "https://github.com/alire-project/alire.git";

    console.log(`Builing alr from branch [${branch}]`)

    await exec.exec(`git clone -b ${branch} ${repo_url} ${install_dir}`);
        process.chdir(install_dir);
        await exec.exec(`git submodule update --init --recursive`);

        if (process.platform == "darwin") {
            process.env.OS = "macOS"
            console.log("NOTE: Configuring ENV for macOS")
        } else {
            console.log("NOTE: Configuring ENV for Linux/Windows")
        }

        await exec.exec(`gprbuild -j0 -p -XSELFBUILD=False -P alr_env.gpr -cargs -fPIC`);

        core.addPath(path.join(process.cwd(), 'bin'));
}

async function install_release(version : string) {
    const base_url : string = "https://github.com/alire-project/alire/releases/download";

    console.log(`Deploying alr version [${version}]`)

    var infix    : string;
    var platform : string;

    switch(version) {
        case '1.0.1':
            infix = "bin";
            break;
        default:
            infix = "bin-x86_64";
            break;
    }

    switch (process.platform) {
        case 'linux':
            platform = "linux";
            break;
        case 'darwin':
            platform = "macos";
            break;
        case 'win32':
            platform = "windows";
            break;
        default:
            throw new Error('Unknown platform ' + process.platform);
    }

    var url : string = `${base_url}/v${version}/alr-${version}-${infix}-${platform}.zip`;

    console.log(`Downloading file: ${url} to ${install_dir}`)
    const dlFile = await tc.downloadTool(url);
    await tc.extractZip(dlFile, install_dir);

    core.addPath(path.join(process.cwd(), install_dir, 'bin'));
}

async function run() {
    try {
        const version   : string = core.getInput('version');
        const branch    : string = core.getInput('branch');
        const tool_args : string = core.getInput('toolchain');
        const tool_dir  : string = core.getInput('toolchain_dir');

        // Install the requested version/branch
        if (branch.length == 0) {
            await install_release(version);
        }
        else {
            await install_branch(branch);
        }

        // And configure the toolchain
        if (tool_args.length > 0) {
            if (tool_dir.length == 0) {
                await exec.exec(`alr -n toolchain ${tool_args != "--disable-assistant" ? "--select " : ""} ${tool_args}`);
            } else {
                await exec.exec(`alr -n toolchain --install ${tool_args} --install-dir ${tool_dir}`);
            }
        }

        // Show the alr now in the environment and the configured toolchain
        console.log("Installed alr version and GNAT toolchain:");
        await exec.exec(`alr -n version`);
        await exec.exec(`alr -n toolchain`);

        console.log("SUCCESS");

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.stack);
            core.setFailed(error.message);
        }
        else {
            core.setFailed("Unknown error situation");
        }
    }
}

run();
