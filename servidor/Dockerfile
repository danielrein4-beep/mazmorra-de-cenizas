FROM node:20-alpine
WORKDIR /app
COPY servidor.mjs .
ENV PORT=8080 DATOS=/datos
RUN mkdir -p /datos && chown node:node /datos
VOLUME ["/datos"]
EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/salud || exit 1
CMD ["node", "servidor.mjs"]
