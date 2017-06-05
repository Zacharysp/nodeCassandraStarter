/**
 * Created by dzhang on 2/28/17.
 */

const expect = require('chai').expect;
const userModel = require('../../app/models/user');

let user_id = 'ef8f9b40-6bca-11e5-9241-59e0ce395c8a';

describe('User', function () {
    it('should successfully find user by user id', function (done) {
        userModel.findById(user_id, function(err, result){
            expect(err).to.be.null;
            expect(result).to.be.an('array');
            done();
        });
    });
});
