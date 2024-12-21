FROM amazoncorretto:17-al2023-headless

COPY /server/build/libs/wallet-0.0.1.jar wallet-0.0.1-SNAPSHOT.jar
COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh", "wallet-0.0.1-SNAPSHOT.jar"]