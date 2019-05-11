//Require dependancies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const Post = require('../models/posts');
const User = require('../models/users');

let token = '';

const should = chai.should();

chai.use(chaiHttp);

describe('Telepath API', () => {
	before((done) => {
		Post.deleteMany({}, (err) => { 
			User.deleteMany({}, (err) => { 
				done();           
			});  
		});      
	});

	after((done) => {
		Post.deleteMany({}, (err) => { 
			User.deleteMany({}, (err) => { 
				done();           
			});  
		});   
	});

	describe('/GET /', () => {
		it('it should GET a welcome message', (done) => {
			chai.request(server).get('/').end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Hello');
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/GET /doesntexist', () => {
		it('it should GET a non existent page and return 404', (done) => {
			chai.request(server).get('/doesntexist').end((err, res) => {
				res.should.have.status(404);
				res.body.should.have.property('message');
				res.body.message.should.be.eql('Not found');
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/POST /users/register', () => {
		it('it should POST a new user with the required parameters', (done) => {
			let user = {name: 'Ewan', email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/users/register').send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				done();
			});
		});

		it('it should NOT POST a new user without the required parameters', (done) => {
			let user = {};
			chai.request(server).post('/users/register').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				done();
			});
		});
	});

	describe('/POST /users/authenticate', () => {
		it('it should POST and login with the required params and give token', (done) => {
			let user = {email: 'ewan@ewan.com', password: 'password@1234'};
			chai.request(server).post('/users/authenticate').send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.should.have.property('data');
				res.body.data.should.have.property('token');
				token = res.body.data.token;
				done();
			});
		});
		it('it should NOT POST and login with with a non existant user', (done) => {
			let user = {email: 'fake@fake.com', password: 'thisisfake'};
			chai.request(server).post('/users/authenticate').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
	});

	describe('/POST /posts', () => {
		it('it should NOT POST posts when there is no session', (done) => {
			chai.request(server).post('/posts').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should POST posts with a session token', (done) => {
			let post = {content: 'Hello'};
			chai.request(server).post('/posts').set('x-access-token', token).send(post).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('success');
				res.body.message.should.be.eql('Post created');
				done();
			});
		});
	});

	describe('/GET /posts', () => {
		it('it should NOT GET posts when there is no session', (done) => {
			chai.request(server).post('/posts').end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.status.should.be.eql('error');
				done();
			});
		});
		it('it should GET posts with a session token', (done) => {
			chai.request(server).get('/posts').set('x-access-token', token).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
				res.body[0].should.have.property('content');
				res.body.length.should.eql(1);
				done();
			});
		});
	});
});