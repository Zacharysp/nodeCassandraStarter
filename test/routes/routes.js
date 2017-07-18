/**
 * Created by dzhang on 2/21/17.
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const logger = require('../../app/utilities/logger');
const app = require('../../app');
const expect = chai.expect;

chai.use(chaiHttp);

before((done) => {
    global.logger = logger;
    setTimeout(() => {
        logger.info('Setting up cassandra connection');
        done();
    }, 2000);
});

let atoken = '5303b770af1eb91e085b54f21fe9fe93cd74fde3';

describe('Live Connect API', () => {
    describe('GET /user', () => {
        it('should return user by user id', (done) => {
            chai.request(app)
                .get('/contact')
                .set('Authorization', 'Bearer ' + atoken) // permanent access token for testing purpose
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
