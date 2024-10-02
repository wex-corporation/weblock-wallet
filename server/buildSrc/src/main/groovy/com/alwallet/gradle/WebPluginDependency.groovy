package com.alwallet.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project

class WebPluginDependency implements Plugin<Project> {

    @Override
    void apply(Project project) {
        project.dependencyManagement {
            imports {
                mavenBom "org.springframework.cloud:spring-cloud-dependencies:2022.0.4"
            }
            test {
                useJUnitPlatform()
            }
        }

        project.dependencies {
            implementation 'org.springframework.boot:spring-boot-starter-actuator'
            implementation 'org.springframework.boot:spring-boot-starter-web'
            implementation 'org.springdoc:springdoc-openapi-ui:1.7.0'
            implementation 'org.springdoc:springdoc-openapi-webflux-ui:1.7.0'
            implementation 'io.opentracing:opentracing-api:0.33.0'
            implementation 'io.opentracing:opentracing-util:0.33.0'
            implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
            implementation 'io.jsonwebtoken:jjwt-impl:0.12.3'
            implementation "io.jsonwebtoken:jjwt-jackson:0.12.3"
            implementation 'com.auth0:jwks-rsa:0.22.1'
            implementation 'org.json:json:20231013'
        }
    }
}
