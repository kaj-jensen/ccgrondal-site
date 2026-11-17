import {execFileSync} from 'node:child_process';
import {currentReleaseContext} from './release-policy.mjs';
const release = currentReleaseContext();
const path = release.preview ? `repos/kaj-jensen/ccgrondal-site/pulls/${release.number}` : 'repos/kaj-jensen/ccgrondal-site/git/ref/heads/main';
const live = JSON.parse(execFileSync('gh', ['api', path], {encoding: 'utf8'}));
if ((release.preview ? live.head.sha : live.object.sha) !== release.sha || (release.preview && live.state !== 'open')) {
  throw new Error('Source has moved; deploy the newest checked commit instead');
}
const checkedOut = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
if (checkedOut !== release.sha) throw new Error('Checkout does not match tested release');
console.log('Exact source commit confirmed.');
