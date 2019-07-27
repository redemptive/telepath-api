//Require dependancies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const Post = require('../models/posts');
const User = require('../models/users');
const Team = require('../models/teams');

let token = '';

const should = chai.should();

chai.use(chaiHttp);

describe('Telepath API', () => {
	before((done) => {
		Post.deleteMany({}, (err) => { 
			User.deleteMany({}, (err) => { 
				Team.deleteMany({}, (err) => { 
					done();           
				});            
			});  
		});      
	});

	after((done) => {
		Post.deleteMany({}, (err) => { 
			User.deleteMany({}, (err) => { 
				Team.deleteMany({}, (err) => { 
					done();           
				});            
			});  
		}); 
	});

	describe('/GET /api', () => {
		it('it should GET a welcome message', (done) => {
			chai.request(server).get('/api').end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Hello');
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/GET /api/doesntexist', () => {
		it('it should GET a non existent page and return 404', (done) => {
			chai.request(server).get('/api/doesntexist').end((err, res) => {
				res.should.have.status(404);
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Not found');
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/POST /api/register', () => {
		it('it should POST a new user with the required parameters', (done) => {
			let user = {name: 'Ewan', email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				done();
			});
		});

		it('it should not POST a user with the same email as an existing user', (done) => {
			let user = {name: 'Duplicate Ewan', email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				res.body.should.have.property('message');
				res.body.message.should.be.eql('User already exists');
				done();
			});
		});

		it('it should not POST a user with a password that doesn\'t have a number or special character', (done) => {
			let user = {name: 'Another Ewan', email: 'anotherewan@ewan.com', password: 'password'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Passwords must contain one number and one special character');
				done();
			});
		});

		it('it should NOT POST a new user without the required parameters', (done) => {
			let user = {};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/POST /api/authenticate', () => {
		it('it should POST and login with the required params and give token', (done) => {
			let user = {email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.should.have.property('data');
				res.body.data.should.have.property('token');
				token = res.body.data.token;
				done();
			});
		});
		it('it should NOT POST and login with with a non existant user, returning 401 unauthenticated', (done) => {
			let user = {email: 'fake@fake.com', password: 'thisisfake'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				res.should.have.status(401);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Unauthorized');
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Invalid email/password');
				done();
			});
		});
		it('it should NOT POST and login with with an incorrect password, returning 401 unauthenticated', (done) => {
			let user = {email: 'ewan@ewan.com', password: 'not@my1password'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				res.should.have.status(401);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Unauthorized');
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Invalid email/password');
				done();
			});
		});
	});

	describe('/POST /api/posts', () => {
		it('it should NOT POST posts when there is no session', (done) => {
			let post = {content: 'Hello'};
			chai.request(server).post('/api/posts').send(post).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST posts with no post parameter', (done) => {
			chai.request(server).post('/api/posts').set('x-access-token', token).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST posts with a session token', (done) => {
			let post = {content: 'Hello'};
			chai.request(server).post('/api/posts').set('x-access-token', token).send(post).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Post created');
				done();
			});
		});
	});

	describe('/GET /api/posts', () => {
		it('it should NOT GET posts when there is no session', (done) => {
			chai.request(server).post('/api/posts').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET posts with a session token with NO user emails or passwords', (done) => {
			chai.request(server).get('/api/posts').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('content');
				res.body[0].should.have.property('userId');
				res.body[0].userId.should.not.have.property('password');
				res.body.length.should.eql(1);
				done();
			});
		});
	});

	describe('/POST /api/teams', () => {
		it('it should NOT POST teams when there is no session', (done) => {
			chai.request(server).post('/api/teams').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST teams with no parameters', (done) => {
			chai.request(server).post('/api/teams').set('x-access-token', token).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST teams with a session token', (done) => {
			let team = {name: 'DevOps'};
			chai.request(server).post('/api/teams').set('x-access-token', token).send(team).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Team created');
				done();
			});
		});
		it('it should NOT POST teams with a name which already exists', (done) => {
			let team = {name: 'DevOps'};
			chai.request(server).post('/api/teams').set('x-access-token', token).send(team).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/GET /api/teams', () => {
		it('it should NOT GET teams when there is no session', (done) => {
			chai.request(server).post('/api/teams').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET teams with a session token', (done) => {
			chai.request(server).get('/api/teams').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('name');
				res.body.length.should.eql(1);
				done();
			});
		});
	});

	describe('/GET /api/teams/:name', () => {
		it('it should NOT GET a team when there is no session', (done) => {
			chai.request(server).get('/api/teams/DevOps').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT GET a team which doesn\'t exist', (done) => {
			chai.request(server).get('/api/teams/NonExistantTeam').set('x-access-token', token).end((err, res) => {
				res.should.have.status(404);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Not found');
				done();
			});
		});

		it('it should GET a single team with their unique name', (done) => {
			chai.request(server).get('/api/teams/DevOps').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('name');
				done();
			});
		});
	});

	describe('/POST /api/teams/:name/users', () => {
		it('it should NOT POST a user to a team when there is no session', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST a user to a team with no parameters', (done) => {
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST a user to a team with a session token', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('User added');
				done();
			});
		});
		it('it should NOT POST a user to a team who is already in it', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST a user to a team who doesn\'t exist', (done) => {
			let user = {name: 'FakeEwan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/GET /api/users', () => {
		it('it should NOT GET users when there is no session', (done) => {
			chai.request(server).get('/api/users').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET all users with a session token (without returning passwords or email)', (done) => {
			chai.request(server).get('/api/users').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('name');
				res.body[0].should.not.have.property('email');
				res.body[0].should.not.have.property('password');
				res.body.length.should.eql(1);
				done();
			});
		});
	});

	describe('/GET /api/users/:name', () => {
		it('it should NOT GET a user when there is no session', (done) => {
			chai.request(server).get('/api/users/Ewan').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT GET a single user which doesn\'t exist', (done) => {
			chai.request(server).get('/api/users/FakeEwan').set('x-access-token', token).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should GET a single user with their unique name NOT displaying email or password... obviously', (done) => {
			chai.request(server).get('/api/users/Ewan').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('name');
				res.body.should.not.have.property('email');
				res.body.should.not.have.property('password');
				done();
			});
		});
	});
});