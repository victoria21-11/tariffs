<?php
class Tariff extends CI_Controller {

    public function index()
    {
        return $this->load->view('tariff/index');
    }
}