//Require dependancies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const Post = require('../models/Post');
const User = require('../models/User');
const Team = require('../models/Team');
const UserMessage = require('../models/UserMessage');

let token = '';
let nonAdminToken = '';

let dumpResponses = false;

const dumpResBody = (res) => {dumpResponses ? console.log(res.body) : null};

const should = chai.should();

chai.use(chaiHttp);

const wipeDb = (done) => {
	Post.deleteMany({}, (err) => { 
		User.deleteMany({}, (err) => { 
			Team.deleteMany({}, (err) => { 
				UserMessage.deleteMany({}, (err) => {
					done(); 
				});          
			});            
		});  
	}); 
}

describe('Telepath API', () => {
	before((done) => {
		wipeDb(done);
	});

	after((done) => {
		wipeDb(done);
	});

	describe('/GET /api', () => {
		it('it should GET a welcome message', (done) => {
			chai.request(server).get('/api').end((err, res) => {
				dumpResBody(res);
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
				dumpResBody(res);
				res.should.have.status(404);
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Not found');
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/POST /api/register', () => {
		it('it should POST a new user with the required parameters, giving admin to the first user', (done) => {
			let user = {name: 'Ewan', email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.should.have.property('userClass');
				res.body.userClass.should.be.eql('admin');
				done();
			});
		});

		it('it should POST a new user with the required parameters, giving regular user to second user', (done) => {
			let user = {name: 'NonAdminEwan', email: 'regularewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.should.have.property('userClass');
				res.body.userClass.should.be.eql('regular');
				done();
			});
		});

		it('it should NOT POST a user with an invalid email address', (done) => {
			let user = {name: 'Hacker Ewan', email: 'not a)valid.email', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT POST a user with a blank name', (done) => {
			let user = {name: '', email: 'super@validemail.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT POST a user with a blank password', (done) => {
			let user = {name: 'Yet Another Ewan', email: 'super@validemail.com', password: ''};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should not POST a user with the same email as an existing user', (done) => {
			let user = {name: 'Duplicate Ewan', email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/register').send(user).end((err, res) => {
				dumpResBody(res);
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
				dumpResBody(res);
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
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/POST /api/authenticate', () => {
		it('it should POST and login with the required params and give token for an admin user', (done) => {
			let user = {email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.should.have.property('data');
				res.body.data.should.have.property('token');
				token = res.body.data.token;
				done();
			});
		});

		it('it should POST and login with the required params and give token for a non admin user', (done) => {
			let user = {email: 'regularewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.should.have.property('data');
				res.body.data.should.have.property('token');
				nonAdminToken = res.body.data.token;
				done();
			});
		});
	
		it('it should NOT POST and login with with a non existant user, returning 401 unauthenticated', (done) => {
			let user = {email: 'fake@fake.com', password: 'thisisfake'};
			chai.request(server).post('/api/authenticate').send(user).end((err, res) => {
				dumpResBody(res);
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
				dumpResBody(res);
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
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST posts with no post parameter', (done) => {
			chai.request(server).post('/api/posts').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST posts with a session token of an admin user', (done) => {
			let post = {content: 'Hello'};
			chai.request(server).post('/api/posts').set('x-access-token', token).send(post).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Post created');
				done();
			});
		});

		it('it should POST posts with a session token of a non admin user', (done) => {
			let post = {content: 'Hello'};
			chai.request(server).post('/api/posts').set('x-access-token', nonAdminToken).send(post).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Post created');
				done();
			});
		});
	});

	describe('/POST /api/users/:name/messages', () => {
		it('it should NOT POST messages when there is no session', (done) => {
			let message = {content: 'Hello'};
			chai.request(server).post('/api/users/Ewan/messages').send(message).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST messages with no message parameter', (done) => {
			chai.request(server).post('/api/users/Ewan/messages').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST messages with a session token of an admin user', (done) => {
			let message = {content: 'Hello non admin ewan'};
			chai.request(server).post('/api/users/NonAdminEwan/messages').set('x-access-token', token).send(message).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Message sent');
				done();
			});
		});

		it('it should POST messages with a session token of a non admin user', (done) => {
			let message = {content: 'Hello admin ewan'};
			chai.request(server).post('/api/users/Ewan/messages').set('x-access-token', nonAdminToken).send(message).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Message sent');
				done();
			});
		});

		it('it should NOT POST a message to a non existant user', (done) => {
			let message = {content: 'Hello'};
			chai.request(server).post('/api/users/FakeEwan/messages').set('x-access-token', token).send(message).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				res.body.message.should.be.eql('Unknown recipient');
				done();
			});
		});
	});

	describe('/GET /api/messages', () => {
		it('it should NOT GET messages when there is no session', (done) => {
			chai.request(server).post('/api/messages').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET messages for the admin user ONLY returning its own messages and ONLY returning sender names', (done) => {
			chai.request(server).get('/api/messages').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('content');
				res.body[0].content.should.be.eql('Hello admin ewan');
				res.body[0].should.have.property('sender');
				res.body[0].sender.should.not.have.property('password');
				res.body[0].sender.should.not.have.property('email');
				res.body.length.should.eql(1);
				done();
			});
		});

		it('it should GET messages for the non admin user ONLY returning its own messages and ONLY returning sender names', (done) => {
			chai.request(server).get('/api/messages').set('x-access-token', nonAdminToken).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('content');
				res.body[0].content.should.be.eql('Hello non admin ewan');
				res.body[0].should.have.property('sender');
				res.body[0].sender.should.not.have.property('password');
				res.body[0].sender.should.not.have.property('email');
				res.body.length.should.eql(1);
				done();
			});
		});
	});

	describe('/GET /api/posts', () => {
		it('it should NOT GET posts when there is no session', (done) => {
			chai.request(server).post('/api/posts').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET posts with a session token with NO user emails or passwords', (done) => {
			chai.request(server).get('/api/posts').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('content');
				res.body[0].should.have.property('userId');
				res.body[0].userId.should.not.have.property('password');
				res.body.length.should.eql(2);
				done();
			});
		});
	});

	describe('/POST /api/teams', () => {
		it('it should NOT POST teams when there is no session', (done) => {
			chai.request(server).post('/api/teams').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST teams with no parameters', (done) => {
			chai.request(server).post('/api/teams').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST teams with a session token of a non admin user', (done) => {
			let team = {name: 'DevOpsNonAdmin'};
			chai.request(server).post('/api/teams').set('x-access-token', nonAdminToken).send(team).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Insufficient permissions');
				res.body.message.should.be.eql('Insufficient permissions');
				done();
			});
		});

		it('it should POST teams with a session token of an admin user', (done) => {
			let team = {name: 'DevOps'};
			chai.request(server).post('/api/teams').set('x-access-token', token).send(team).end((err, res) => {
				dumpResBody(res);
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
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/POST /api/teams/:name/users', () => {
		it('it should NOT POST a user to a team when there is no session', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST a user to a team with no parameters', (done) => {
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST a user to a team with a session token of an admin user', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('User added');
				done();
			});
		});
		it('it should NOT POST a user to a team with a session token of a non admin user', (done) => {
			let user = {name: 'NonAdminEwan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', nonAdminToken).send(user).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Insufficient permissions');
				res.body.message.should.be.eql('Insufficient permissions');
				done();
			});
		});
		it('it should NOT POST a user to a team who is already in it', (done) => {
			let user = {name: 'Ewan'};
			chai.request(server).post('/api/teams/DevOps/users').set('x-access-token', token).send(user).end((err, res) => {
				dumpResBody(res);
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
				dumpResBody(res);
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
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET teams with a session token ONLY returning member user names', (done) => {
			chai.request(server).get('/api/teams').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('name');
				res.body.length.should.eql(1);
				res.body[0].should.have.property('users');
				res.body[0].users.should.be.a('array');
				res.body[0].users[0].should.have.property('name');
				res.body[0].users[0].should.not.have.property('password');
				res.body[0].users[0].should.not.have.property('email');
				done();
			});
		});
	});

	describe('/GET /api/teams/:name', () => {
		it('it should NOT GET a team when there is no session', (done) => {
			chai.request(server).get('/api/teams/DevOps').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT GET a team which doesn\'t exist', (done) => {
			chai.request(server).get('/api/teams/NonExistantTeam').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(404);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Not found');
				done();
			});
		});

		it('it should GET a single team with their unique name NOT showing id,email,password ONLY names', (done) => {
			chai.request(server).get('/api/teams/DevOps').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('name');
				res.body.should.have.property('users');
				res.body.users.length.should.be.eql(1);
				res.body.users[0].should.not.have.property('email');
				res.body.users[0].should.not.have.property('password');
				done();
			});
		});
	});

	describe('/GET /api/users', () => {
		it('it should NOT GET users when there is no session', (done) => {
			chai.request(server).get('/api/users').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET all users with a session token (without returning passwords or email)', (done) => {
			chai.request(server).get('/api/users').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('name');
				res.body[0].should.not.have.property('email');
				res.body[0].should.not.have.property('password');
				res.body.length.should.eql(2);
				done();
			});
		});
	});

	describe('/GET /api/users/:name', () => {
		it('it should NOT GET a user when there is no session', (done) => {
			chai.request(server).get('/api/users/Ewan').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT GET a single user which doesn\'t exist', (done) => {
			chai.request(server).get('/api/users/FakeEwan').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(404);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Not found');
				done();
			});
		});

		it('it should GET a single user with their unique name NOT displaying email or password... obviously', (done) => {
			chai.request(server).get('/api/users/Ewan').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('name');
				res.body.should.not.have.property('email');
				res.body.should.not.have.property('password');
				done();
			});
		});
	});

	describe('/POST /api/admins', () => {
		it('it should NOT POST admins when there is no session', (done) => {
			chai.request(server).post('/api/admins').end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST admins with no parameters', (done) => {
			chai.request(server).post('/api/admins').set('x-access-token', token).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should NOT POST admins with a session token of a non admin user', (done) => {
			let admin = {user: 'NonAdminEwan'};
			chai.request(server).post('/api/admins').set('x-access-token', nonAdminToken).send(admin).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(403);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('Insufficient permissions');
				res.body.message.should.be.eql('Insufficient permissions');
				done();
			});
		});

		it('it should POST admins with a session token of an admin user', (done) => {
			let admin = {user: 'NonAdminEwan'};
			chai.request(server).post('/api/admins').set('x-access-token', token).send(admin).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Admin created');
				done();
			});
		});

		it('it should then allow POST /api/teams admin admin only route with the user we made admin', (done) => {
			let team = {name: 'NewDevOps'};
			chai.request(server).post('/api/teams').set('x-access-token', nonAdminToken).send(team).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Team created');
				done();
			});
		});

		it('it should NOT POST admins with a user who is already an admin', (done) => {
			let admin = {user: 'Ewan'};
			chai.request(server).post('/api/admins').set('x-access-token', token).send(admin).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});

		it('it should NOT POST admins with a user who doesnt exist', (done) => {
			let admin = {user: 'FakeEwan'};
			chai.request(server).post('/api/admins').set('x-access-token', token).send(admin).end((err, res) => {
				dumpResBody(res);
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});
});