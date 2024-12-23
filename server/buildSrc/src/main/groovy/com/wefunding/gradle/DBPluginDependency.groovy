package com.wefunding.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project

class DBPluginDependency implements Plugin<Project> {

    @Override
    void apply(Project project) {

        project.dependencies {
            implementation 'org.springframework.boot:spring-boot-starter-data-r2dbc'
            runtimeOnly 'org.postgresql:postgresql'
            runtimeOnly 'org.postgresql:r2dbc-postgresql'
        }
    }
}
