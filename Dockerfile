FROM gradle:8.3-jdk17 as build

WORKDIR /workspace

COPY server/ .
RUN cd wallet
# RUN gradle spotlessApply
RUN gradle clean build
RUN gradle build

FROM openjdk:17-jdk-slim

COPY --from=build /workspace/wallet/build/libs/wallet-0.0.1.jar wallet-0.0.1-SNAPSHOT.jar
COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh", "wallet-0.0.1-SNAPSHOT.jar"]
