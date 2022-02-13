module.exports = {
    //Return Error Message Helper
    getError(errors, prop) {
        try {
            return errors.mapped()[prop].msg;
        } catch (err) {
            return '';
        }
    }
}