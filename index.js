require('dotenv').config();

const Hapi = require('@hapi/hapi');

const CollegeRoutes = require('./routes/College');

const HapiSwagger = require('hapi-swagger');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Pack = require('./package');

const init = async () => {

	const server = Hapi.server({
		port: process.env.PORT,
		routes: {
			cors: true
		}
	});

	await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				info: {
					title: 'college-costs-api Documentation',
					version: Pack.version
				},
				grouping: 'tags',
			}
		}
	]);

	server.validator(require('@hapi/joi'))
	
	server.route([
		{
			method: 'GET',
			path: '/',
			config: {
				handler: (req, reply) => {
					return reply.redirect('/documentation');
				}
			}
		},
		...CollegeRoutes
	]);

	await server.start();
	console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();