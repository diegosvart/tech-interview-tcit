El trabajo consiste en crear una pequeña aplicación en react, con Redux, que maneje Posts.

Los Posts deben tener:
1.	Nombre
2.	Descrpición
Buenas prácticas:
1.	JSON camel-case
2.	JS camel-case
3.	Ruby en snake case
Funcionalidades aplicación web hecha con React y Redux
1.	Insertar posts
2.	Eliminar posts
3.	Listar posts
4.	Filtrar posts por nombre localmente
Estructura:
1.	Formulario
2.	Filtro
3.	Lista
Backend (API JSON) en Node.js o Rails:
1.	Crear posts: Deberá retornar el post creado
2.	Eliminar posts: Deberá retornar el post eliminado
3.	Obtener lista de posts: Deberá retornar todos los posts
4.	BD en postgreSQL

Otras consideraciones

1.	Solo se debe llamar al endpoint que entrega la lista completa de posts una sola vez por cada vez que se cargue la vista
2.	Hacer un README.md que explique cómo levantar el ambiente de desarrollo del proyecto
3.	Se debe utilizar un ORM para comunicarse con la BD