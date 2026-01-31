# C4 Container Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Container Diagram for Qwertix

Person(user, "Player", "A user playing solo or with friends")

System_Boundary(c1, "Qwertix System") {
    Container(frontend, "Frontend Application", "React, Vite, FSD", "Provides UI for racing, lobby management, and stats")
    Container(api, "API Server", "Node.js, Fastify, WebSocket", "Handles game logic, real-time sync, and authentication")
    ContainerDb(db, "Database", "PostgreSQL", "Stores users, race results, and history")
    Container(proxy, "Reverse Proxy", "Traefik", "Handles SSL termination and load balancing")
}

Rel(user, proxy, "Uses", "HTTPS/WSS")
Rel(proxy, frontend, "Serves static files to", "HTTPS")
Rel(proxy, api, "Proxies requests to", "HTTPS/WSS")
Rel(frontend, api, "API calls & Socket events", "JSON/WS")
Rel(api, db, "Reads/Writes", "Drizzle ORM (TCP)")
@enduml
```