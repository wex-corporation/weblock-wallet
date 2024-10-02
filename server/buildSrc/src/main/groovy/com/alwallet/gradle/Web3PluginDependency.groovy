package com.alwallet.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project

class Web3PluginDependency implements Plugin<Project> {

    @Override
    void apply(Project project) {
        project.dependencies {
            implementation 'org.web3j:core:5.0.0'
        }
    }
}
