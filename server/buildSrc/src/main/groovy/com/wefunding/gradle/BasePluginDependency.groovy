package com.wefunding.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project

class BasePluginDependency implements Plugin<Project> {

    @Override
    void apply(Project project) {
        project.repositories {
            mavenCentral()
        }
        project.group = "com.wefunding"
        project.version = "0.0.1"
        project.sourceCompatibility = 17

        project.configurations {
            compileOnly {
                extendsFrom annotationProcessor
            }
        }

        project.dependencies {
            compileOnly 'org.projectlombok:lombok'
            developmentOnly 'org.springframework.boot:spring-boot-devtools'
            annotationProcessor 'org.projectlombok:lombok'
            implementation 'junit:junit:4.13.2'
            implementation 'org.bitbucket.b_c:jose4j:0.9.4'
            testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.7.0'
            testImplementation 'org.junit.jupiter:junit-jupiter-api:5.7.0'
            testImplementation "org.testcontainers:testcontainers:1.18.3"
            testImplementation "org.testcontainers:junit-jupiter:1.18.3"
            testImplementation 'org.testcontainers:postgresql:1.18.3'
            testImplementation 'org.springframework.boot:spring-boot-starter-test'
        }

        project.spotless {
            java {
                googleJavaFormat()
                targetExclude '**/generated/**'
            }
        }
    }
}
