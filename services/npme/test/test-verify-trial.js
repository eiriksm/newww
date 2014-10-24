var Lab = require('lab'),
    lab = exports.lab = Lab.script(),
    describe = lab.experiment,
    before = lab.before,
    after = lab.after,
    it = lab.test,
    expect = Lab.expect;

var Hapi = require('hapi'),
    npme = require('../index'),
    request = require('request'),
    nock = require('nock'),
    config = require('../../../config');

var server;

before(function (done) {
  server = Hapi.createServer('localhost', '9116');

  server.pack.register([
    {
      plugin: npme,
      options: config
    }
  ], function () {
    server.start(done);
  });
});

describe('verifying a trial in hubspot', function () {
  it('returns a trial when a customer submits a valid verification key', function (done) {
    var verificationKey = '12-34-56',
        trialId = 'ab-cd-ef';

    var hubspot = nock('https://billing.website.com')
        .get('/trial/' + verificationKey)
        .reply(200, {id: trialId})
        .put('/trial/' + trialId + '/verification')
        .reply(200, {verified: true})

    server.methods.npme.verifyTrial(verificationKey, function (err, verifiedTrial) {
      expect(err).to.not.exist;
      expect(verifiedTrial.verified).to.be.true;
      done();
    });
  });

  it('returns a trial when a customer submits an already verified verification key', function (done) {
    var verificationKey = '12-34-56',
        trialId = 'ab-cd-ef';

    var hubspot = nock('https://billing.website.com')
        .get('/trial/' + verificationKey)
        .reply(200, {id: trialId, verified: true})

    server.methods.npme.verifyTrial(verificationKey, function (err, verifiedTrial) {
      expect(err).to.not.exist;
      expect(verifiedTrial.id).to.equal.trialId;
      expect(verifiedTrial.verified).to.be.true;
      done();
    });
  });

  it('returns an error for a verification key that does not exist', function (done) {
    var verificationKey = '12-34-56',
        trialId = 'ab-cd-ef';

    var hubspot = nock('https://billing.website.com')
        .get('/trial/' + verificationKey)
        .reply(404)

    server.methods.npme.verifyTrial(verificationKey, function (err, verifiedTrial) {
      expect(err).to.exist;
      expect(err.message).to.equal('verification key not found');
      expect(verifiedTrial).to.not.exist;
      done();
    });
  });

  it('returns an error if there is a problem verifying the trial', function (done) {
    var verificationKey = '12-34-56',
        trialId = 'ab-cd-ef';

    var hubspot = nock('https://billing.website.com')
        .get('/trial/' + verificationKey)
        .reply(400)

    server.methods.npme.verifyTrial(verificationKey, function (err, verifiedTrial) {
      expect(err).to.exist;
      expect(err.message).to.equal('problem verifying trial');
      expect(verifiedTrial).to.not.exist;
      done();
    });
  });

  it('returns an error if there is a problem starting the trial', function (done) {
    var verificationKey = '12-34-56',
        trialId = 'ab-cd-ef';

    var hubspot = nock('https://billing.website.com')
        .get('/trial/' + verificationKey)
        .reply(200, {id: trialId})
        .put('/trial/' + trialId + '/verification')
        .reply(400)

    server.methods.npme.verifyTrial(verificationKey, function (err, verifiedTrial) {
      expect(err).to.exist;
      expect(err.message).to.equal('problem starting trial');
      expect(verifiedTrial).to.not.exist;
      done();
    });
  });

});