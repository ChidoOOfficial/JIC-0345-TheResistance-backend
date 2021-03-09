function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/user/login/successful')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/user/login/successful')
    }
    next()
}

module.exports = {
  checkNotAuthenticated, 
  checkAuthenticated
};