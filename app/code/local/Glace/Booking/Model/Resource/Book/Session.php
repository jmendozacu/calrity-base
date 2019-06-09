<?php
/*
 * Developer: Rene Voorberg
 * Team site: http://cmsideas.net/
 * Support: http://support.cmsideas.net/
 * 
 *
*/
class Glace_Booking_Model_Resource_Book_Session
extends Mage_Core_Model_Resource_Db_Abstract{
    protected function _construct()
    {
        $this->_init('booking/book_session', 'session_id');
    }
}