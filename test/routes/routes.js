/**
 * Created by dzhang on 2/21/17.
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var logger = require('../../app/utilities/logger');
var app = require('../../app');
var expect = chai.expect;

chai.use(chaiHttp);

before(function (done) {
    global.logger = logger;
    setTimeout(function () {
        logger.info('Setting up cassandra connection');
        done()
    }, 2000);
});


var atoken = '5303b770af1eb91e085b54f21fe9fe93cd74fde3';

describe('Live Connect API', function () {

    describe('GET /user', function () {
        it('should return user by user id', function (done) {
            chai.request(app)
                .get('/contact')
                .set('Authorization', 'Bearer ' + atoken) // permanent access token for testing purpose
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
