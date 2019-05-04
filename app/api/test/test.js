//Require dependancies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Telepath API', () => {
	describe('/GET index', () => {
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

	describe('/POST /users/register', () => {
		it('it should POST a new user with the required parameters', (done) => {
			let user = {name: "Ewan", email: "ewan@ewan.com", password: "password@1234"};
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
			let user = {email: "ewan@ewan.com", password: "password@1234"};
			chai.request(server).post('/users/authenticate').send(user).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
				res.body.should.have.property('data');
				res.body.data.should.have.property('token');
				done();
			});
		});
		it('it should NOT POST and login with with a non existant user', (done) => {
			let user = {email: "fake@fake.com", password: "thisisfake"};
			chai.request(server).post('/users/authenticate').send(user).end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('status');
                res.body.status.should.be.eql('error');
				done();
			});
		});
	});
});