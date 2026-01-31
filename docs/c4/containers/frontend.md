# C4 Component Diagram: Frontend (SPA)

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Component Diagram for Frontend Application

Container(frontend, "Frontend SPA", "React, Vite, FSD", "Browser Application")
Container(api, "API Server", "Fastify", "Backend")

Container_Boundary(frontend_boundary, "Frontend Internals (FSD)") {
    Component(pages, "Pages", "Layer", "Routing & Page composition")
    Component(features, "Features", "Layer", "User scenarios (Auth, Race)")
    Component(entities, "Entities", "Layer", "Business models (User, Room, Result)")
    Component(shared, "Shared", "Layer", "UI Kit, API Client, Utils")
}

Rel(pages, features, "Composes")
Rel(features, entities, "Uses")
Rel(entities, shared, "Uses")
Rel(features, shared, "Uses")

Rel(shared, api, "HTTP/WS Requests")
@enduml
```