const ExpressHandler = require('./ExpressHandler');

const URL = "https://repo-store-gh.s3.ap-south-1.amazonaws.com/USERID15/test-express-app/2024-12-04/1733269491775.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAS74TLXADEZHMHDVL%2F20241203%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241203T234452Z&X-Amz-Expires=900&X-Amz-Signature=def3d0730f5fc89818d4334c577a6226745b8ab0dcf908332ba98ffad2accad8&X-Amz-SignedHeaders=host";




(async () => {
    const testInput = {
        deploymentId: 1,
        lambdaFunctionName: 'testLambdaFunction',
        repoZipUrl: URL
    };
    const expressHandler = new ExpressHandler(testInput.deploymentId, testInput.lambdaFunctionName, testInput.repoZipUrl);
    expressHandler.createTempDirForRepo();
    await expressHandler.downloadRepo().then(() => {
        expressHandler.extractZip();
    })
    expressHandler.unlinkTempDir();
    expressHandler.prepareLambda();
    expressHandler.unlinkRepo();
})();
