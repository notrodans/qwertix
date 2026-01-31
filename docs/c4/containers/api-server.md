# C4 Component Diagram: API Server

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Component Diagram for API Server

Container(api, "API Server", "Fastify", "Handles HTTP & WS requests")
ContainerDb(db, "Database", "PostgreSQL", "Stores data")

Container_Boundary(api_boundary, "API Server Internals") {
    Component(auth_ctrl, "Auth Controller", "HTTP", "Handles login/register")
    Component(room_ctrl, "Room Controller", "HTTP", "Handles room creation")
    Component(ws_mgr, "Socket Manager", "WS", "Manages WebSocket connections and routing")
    
    Component(auth_svc, "Auth Service", "Service", "Business logic for auth")
    Component(room_svc, "Room Service", "Service", "Business logic for rooms")
    Component(room_mgr, "Room Manager", "Manager", "In-memory game state management")
    
    Component(user_repo, "User Repository", "Drizzle", "DB Access for Users")
    Component(result_repo, "Result Repository", "Drizzle", "DB Access for Results")
}

Rel(auth_ctrl, auth_svc, "Uses")
Rel(room_ctrl, room_svc, "Uses")
Rel(ws_mgr, room_mgr, "Events")

Rel(auth_svc, user_repo, "Uses")
Rel(room_svc, room_mgr, "Uses")
Rel(room_mgr, result_repo, "Saves results")

Rel(user_repo, db, "SQL")
Rel(result_repo, db, "SQL")
@enduml
```
