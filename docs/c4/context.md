# C4 Context Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title System Context Diagram for Qwertix

Person(user, "Player", "A user playing solo or with friends")
Person(admin, "Administrator", "Manages users and system settings")

System(qwertix, "Qwertix Platform", "Real-time typing competition platform")

Rel(user, qwertix, "Uses", "HTTPS/WSS")
Rel(admin, qwertix, "Manages", "HTTPS")
@enduml
```